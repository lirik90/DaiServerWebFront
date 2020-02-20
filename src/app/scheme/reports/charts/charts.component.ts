import {AfterViewInit, Component, OnInit, QueryList, ViewChildren, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';

import {
  MAT_MOMENT_DATE_FORMATS,
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';

import {TranslateService} from '@ngx-translate/core';
import { BaseChartDirective } from 'ng2-charts';
// import {ChartComponent} from 'angular2-chartjs';

import * as moment from 'moment';
// import * as _moment from 'moment';
// import {default as _rollupMoment} from 'moment';
// const moment = _rollupMoment || _moment;

import {SchemeService, ExportConfig, ExportItem} from '../../scheme.service';
import {Device_Item_Type, DIG_Type, Section, Device_Item, Log_Data, Register_Type} from '../../scheme';
import {PaginatorApi} from '../../../user';

interface DevItemTypeItem {
  id: number;
}

interface DevItemItem extends DevItemTypeItem {
  name: string;
}

interface Chart_Info_Interface {
  name: string;
  data: {
    datasets: any[]
  };
}

enum Chart_Type {
  CT_UNKNOWN,
  CT_USER,
  CT_DIG_TYPE,
  CT_DEVICE_ITEM_TYPE,
  CT_DEVICE_ITEM,
}

function parseDate(date: FormControl, time: string): number {
    let time_arr = time.split(':');
    let date_from = date.value.toDate();
    date_from.setHours(+time_arr[0]);
    date_from.setMinutes(+time_arr[1]);
    date_from.setSeconds(+time_arr[2]);
    return date_from.getTime();
}

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css'],
  providers: [
    // The locale would typically be provided on the root module of your application. We do it at
    // the component level here, due to limitations of our example generation script.
    {provide: MAT_DATE_LOCALE, useValue: 'ru-RU'},

    // `MomentDateAdapter` and `MAT_MOMENT_DATE_FORMATS` can be automatically provided by importing
    // `MatMomentDateModule` in your applications root module. We provide it at the component level
    // here, due to limitations of our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
  ],
})
export class ChartsComponent implements OnInit, AfterViewInit {
  chartType = Chart_Type;

//  date_from = new FormControl(new Date().toISOString().slice(0, -1));
  date_from = new FormControl(moment());
  time_from = '00:00:00';
  date_to = new FormControl(moment());
  time_to = '23:59:59';

  @ViewChild("chart_obj", {static: false}) chart: BaseChartDirective;

  charts_type: number = Chart_Type.CT_DIG_TYPE;
  logs_count: number;

  data_: string;
  time_from_: number;
  time_to_: number;

  prgMode: string;
  prgValue: number;

  group_types: DIG_Type[];
  selected_group_type: DIG_Type;

  itemtypes = new FormControl();
  itemTypeList: Device_Item_Type[];

  devitems = new FormControl();
  devItemList: DevItemItem[] = [];

  charts: Chart_Info_Interface[] = [];

  type = 'line';
  options = {
    responsive: true,
    legend: {
      // display: false,
      // position: 'bottom',
      onClick: (e, legendItem) => {
        const dataset = (<any>this.chart.data).datasets[legendItem.datasetIndex];
        dataset.hidden = !dataset.hidden;

        const y_axix = (<any>this.chart.chart).scales["y-axis-0"];
        this.adjust_stepped(dataset, y_axix.min, y_axix.max);

        this.chart.chart.update();
      }
    },
  //  maintainAspectRatio: false,
    tooltips: {
      mode: 'nearest',
      intersect: false,
      callbacks: {
        // title: function(itemList, data) { // args: Array[tooltipItem], data
        // // Тут можно сделать обработку даты
        // console.log('callback title:', data);
        // return data;
        // },
        label: function(item, data) { // args: tooltipItem, data
          // console.log('callback label:', item, data);
          const dataset = data.datasets[item.datasetIndex];
          const text = dataset.steppedLine ?
            (item.yLabel < dataset["my_cond"] ? '0' : '1') :
            item.value;
          return dataset.label + ": " + text;
        },
        // beforeTitle: function() {
        // return '...beforeTitle';
        // },
        // afterTitle: function() {
        // return '...afterTitle';
        // },
        // beforeBody: function() {
        // return '...beforeBody';
        // },
        // afterBody: function() {
        // return '...afterBody';
        // },
        // beforeLabel: function() {
        // return '...beforeLabel';
        // },
        // afterLabel: function() {
        // return '...afterLabel';
        // },
        // beforeFooter: function() {
        // return '...beforeFooter';
        // },
        // footer: function() {
        // return 'Footer';
        // },
        // afterFooter: function() {
        // return '...afterFooter';
        // },
      }
    },
    hover: {
      mode: 'nearest',
      intersect: false
    },
    scales: {
      xAxes: [{
        type: 'time',
        // unit: 'hour',
        // unitStepSize: 1,
        time: {
          // format: 'MM/DD/YYYY HH:mm',
          tooltipFormat: 'DD MMMM YYYY HH:mm:ss',
          // round: 'hour',
          displayFormats: {
            millisecond: 'H:m',
            second: 'H:m',
            minute: 'H:m',
            hour: 'H:m',
            day: 'H:m',
          },
          // min: new Date({{ year }}, {{ month }} - 1, {{ day }}),
          // max: new Date({{ year }}, {{ month }} - 1, {{ day }}, 23, 59, 59),
        },
        ticks: {
          // min: new Date({{ year }}, {{ month }} - 1, {{ day }}),
          // max: new Date({{ year }}, {{ month }} - 1, {{ day }}, 23, 59, 59),
          // callback: function(value) {
          // console.log(value);
          // return value;
          // },
        },
      }],
    }
  };

  initialized = false;

  ngAfterViewInit() {
  }

  constructor(
    public translate: TranslateService,
    private schemeService: SchemeService,
  ) {
  }

  ngOnInit() {
    this.group_types = this.schemeService.scheme.dig_type;
    if (this.group_types && this.group_types.length) {
      this.selectGroup(this.group_types[0]);
    }

    this.itemTypeList = this.schemeService.scheme.device_item_type;
    for (const sct of this.schemeService.scheme.section) {
      for (const group of sct.groups) {
        for (const item of group.items) {
          const name = sct.name + ' - '
            /*+ (group.title || group.type.title) + ' - '*/ 
            + (item.name || item.type.title);

          this.devItemList.push({id: item.id, name});
        }
      }
    }

    this.initCharts();
  }

  adjust_stepped(dataset: any, y_min: number, y_max: number): void {
    if (dataset.hidden || !dataset.steppedLine || !dataset.data.length)
      return;
    
    const pr = (y_max - y_min) * 0.1;
    const y0 = y_min + pr;
    const y1 = y_max - pr;

    dataset["my_cond"] = y1;

    let cond;
    for (let item of dataset.data)
    {
      if (item.y !== null)
      {
        if (cond === undefined)
          cond = item.y;
        else if (item.y !== cond)
        {
          if (item.y > cond)
            cond = item.y;
          break;
        }
      }
    }

    for (let item of dataset.data)
    {
      if (item.y < cond)
        item.y = y0;
      else
        item.y = y1;
    }
  }

  random_color(): void {
    for (const data of (<any>this.chart.data).datasets) {
      const rndRGB = `${this.randomColorFactor()},${this.randomColorFactor()},${this.randomColorFactor()}`;
      data.borderColor = `rgba(${rndRGB},0.4)`;
      data.backgroundColor = `rgba(${rndRGB},0.5)`;
      data.pointBorderColor = `rgba(${rndRGB},0.7)`;
      data.pointBackgroundColor = `rgba(${rndRGB},0.5)`;
    }
    this.chart.chart.update();
  }

  selectGroup(group_type: DIG_Type): void {
    if (this.selected_group_type && this.selected_group_type.id === group_type.id) {
      return;
    }
    this.selected_group_type = group_type;
  }

  initCharts(): void 
  {
    this.charts = [];
    this.initialized = false;

    let ok: boolean;

    switch(this.charts_type)
    {
    case Chart_Type.CT_DIG_TYPE:
        ok = this.initDIGTypeCharts();
        break;
    case Chart_Type.CT_DEVICE_ITEM_TYPE:
        ok = this.initDeviceItemTypeCharts();
        break;
    case Chart_Type.CT_DEVICE_ITEM:
        ok = this.initDeviceItemCharts();
        break;
    default:
        ok = false;
        break;
    }

    if (!ok)
      return;

    this.time_from_ = parseDate(this.date_from, this.time_from);
    this.time_to_ = parseDate(this.date_to, this.time_to);

    this.prgMode = 'indeterminate';
    this.prgValue = 0;
    this.logs_count = 0;
    this.getLogs();
  }

  initDIGTypeCharts(): boolean {
    if (!this.selected_group_type) {
      console.log('Init charts failed', this.charts_type, this.selected_group_type);
      return false;
    }

    this.data_ = this.selected_group_type.id.toString();

    const sections = this.schemeService.scheme.section;
    for (const sct of sections) {
      for (const group of sct.groups) {
        if (group.type_id === this.selected_group_type.id) {
          const datasets: any[] = [];

          for (const item of group.items) {
            datasets.push(this.genDataset(item));
          }

          console.log('Add chart', sct.name, datasets);
          this.addChart(sct.name, datasets);
          break;
        }
      }
    }

    return true;
  }

  initDeviceItemTypeCharts(): boolean {
    if (this.itemtypes.value.length === 0) {
      console.log('Init charts failed', this.charts_type, this.itemtypes.value);
      return false;
    }

    this.data_ = this.itemtypes.value.join(',');

    const sections = this.schemeService.scheme.section;
    for (const sct of sections) {
      for (const group of sct.groups) {
        const datasets: any[] = [];
        for (const item of group.items) {
          for (const type_id of this.itemtypes.value) {
            if (type_id == item.type.id) {
              datasets.push(this.genDataset(item));
              break;
            }
          }
        }

        if (datasets.length) {
          this.addChart(sct.name, datasets);
        }
      }
    }

    return true;
  }

  initDeviceItemCharts(): boolean {
    if (this.devitems.value.length === 0) {
      console.log('Init charts failed', this.charts_type, this.devitems.value);
      return false;
    }

    this.data_ = this.devitems.value.join(',');

    const datasets: any[] = [];
    const sections = this.schemeService.scheme.section;
    for (const sct of sections) {
      for (const group of sct.groups) {
        for (const item of group.items) {
          for (const item_id of this.devitems.value) {
            if (item_id == item.id) {
              datasets.push(this.genDataset(item, true));
              break;
            }
          }
        }
      }
    }
    this.addChart(this.translate.instant('REPORTS.CHARTS_ELEMENTS'), datasets);

    return true;
  }

  addChart(name: string, datasets: any[]): void {
    if (datasets.length) {
      datasets[0].hidden = false;
    }
    this.charts.push({name, data: {datasets}});
  }

  getLogs(limit: number = 1000, offset: number = 0): void {
    this.schemeService.getChartData(this.time_from_, this.time_to_, this.charts_type, this.data_, limit, offset)
      .subscribe((logs: PaginatorApi<Log_Data>) => this.fillData(logs));
  }

  fillData(logs: PaginatorApi<Log_Data>): void {
    this.logs_count += logs.results.length;
    this.prgValue = this.logs_count / (logs.count / 100.0);

    const need_more: boolean = logs.count > this.logs_count && this.logs_count < 100000;
    if (need_more)
    {
      this.prgMode = 'determinate';
      console.warn(`Log count: ${logs.count} on page: ${logs.results.length} current: ${this.logs_count}`);

      const start = this.logs_count;
      const limit = logs.count - this.logs_count;
      this.getLogs(limit < 1000 ? limit : 1000, this.logs_count);
    }

    let finded: boolean;

    let min_y = 9999, max_y = -9999;
    for (const log of logs.results) {
      finded = false;

      for (const chart of this.charts) {
        for (const dataset of chart.data.datasets) {
          if (dataset.item_id === log.item_id) {
            const x = new Date(log.timestamp_msecs);
            const y = parseFloat(log.value);

            if (min_y > y)
              min_y = y;
            if (max_y < y)
              max_y = y;

            // console.log(`Finded log ${log.item_id} val: ${log.value} date: ${log.timestamp_msecs} t: ${typeof log.timestamp_msecs}`);
            // if (log.value == null || /^(\-|\+)?([0-9]+|Infinity)$/.test(log.value))
            dataset.data.push({x: x, y: log.value});
            finded = true;
            break;
          }
        }
        if (finded) {
          break;
        }
      }
    }

    if (need_more)
      return;

    for (const chart of this.charts) 
      for (const dataset of chart.data.datasets)
        this.adjust_stepped(dataset, min_y, max_y);

    this.initialized = true;
  }

  genDateString(date: Date, time: string): string {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    let date_str: string = date.getFullYear().toString();
    date_str += `-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day} `;
    return date_str + time;
  }

  genDataset(item: Device_Item, add_sct_name: boolean = false): Object {
    // const rndRGB = `${this.randomColorFactor()},${this.randomColorFactor()},${this.randomColorFactor()}`;

    const label = item.name.length ? item.name : item.type.title;
    const rndRGB = this.intToRGB(this.hashCode(label));

    const RT = Register_Type;
    const rt = item.type.register_type;
    const stepped = rt === RT.RT_COILS || rt === RT.RT_DISCRETE_INPUTS;

    return {
      item_id: item.id,
      label: label,
      data: [],

      borderColor: `rgba(${rndRGB},0.4)`,
      backgroundColor: `rgba(${rndRGB},0.5)`,
      pointBorderColor: `rgba(${rndRGB},0.7)`,
      pointBackgroundColor: `rgba(${rndRGB},0.5)`,
      pointBorderWidth: 1,

      hidden: false,
      fill: stepped,
      steppedLine: stepped,
      cubicInterpolationMode: 'monotone',
      //      lineTension: 0,
    };
  }

  hashCode(str: string): number { // java String#hashCode
    var hash = 0;
    for (var i = 0; i < str.length; i++)
       hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return hash;
  }
  
  intToRGB(i: number): string {
    var c = (i & 0x00FFFFFF);
    return (c & 0xFF) + ','
    + ((c >> 8) & 0xFF) + ','
    + ((c >> 16) & 0xFF);
  }

  randomColorFactor(): number {
    return Math.round(Math.random() * 255);
  }

  randomColor(opacity: number): string {
    return `rgba(${this.randomColorFactor()},${this.randomColorFactor()},${this.randomColorFactor()},${opacity || '.3'})`;
  }
}
