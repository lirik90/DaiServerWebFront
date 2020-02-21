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
import {Device_Item_Type, DIG_Param_Value, DIG_Type, Section, Device_Item, Log_Value, Log_Param, Register_Type, Save_Algorithm, DIG_Param_Value_Type, Device_Item_Group} from '../../scheme';
import {PaginatorApi} from '../../../user';

interface Chart_Info_Interface {
  name: string;
  data: {
    datasets: any[]
  };

  min_y: number;
  max_y: number;
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
  logs_count2: number;

  data_: string;
  param_data_: string;
  time_from_: number;
  time_to_: number;
  is_today: boolean;

  prgMode: string;
  prgValue: number;
  prgValue2: number;

  devItemList = [];

  itemList = [];
  selectedItems = [];
  settings: any = {};

  paramList = [];
  paramSelected = [];
  paramSettings: any = {};

  charts: Chart_Info_Interface[] = [];

  values_loaded: boolean;
  params_loaded: boolean;
  initialized = true;

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
          const text = dataset.steppedLine && dataset.dev_item ?
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

  ngAfterViewInit() {
  }

  constructor(
    public translate: TranslateService,
    private schemeService: SchemeService,
  ) {
  }

  ngOnInit() {
    this.OnChartsType();
    this.initCharts();
  }

  OnChartsType(): void {
    this.selectedItems = [];
    this.settings = {
        text: "",
        selectAllText: 'Выбрать все',
        //unSelectAllText: 'Снять все',
        classes: "chart-type-data ctd-items",
        enableSearchFilter: true,
        labelKey: 'title',
        singleSelection: false,
        groupBy: ""
    };

    this.paramSelected = [];
    this.paramSettings = {
        text: "",
        selectAllText: 'Выбрать все',
        classes: "chart-type-data custom-class",
        enableSearchFilter: true,
        labelKey: 'title',
        groupBy: "category"
    };

    switch(this.charts_type)
    {
    case Chart_Type.CT_DIG_TYPE:
        this.itemList = this.schemeService.scheme.dig_type;
        if (this.itemList.length)
          this.selectedItems.push(this.itemList[0]);
        this.settings.text = "Выберите тип группы";
        this.settings.singleSelection = true;

        this.paramList = this.getParamTypeList();
        this.paramSettings.text = "Выберите тип уставки";
        break;
    case Chart_Type.CT_DEVICE_ITEM_TYPE:
        this.itemList = this.schemeService.scheme.device_item_type;
        this.settings.text = "Выберите тип элемента";

        this.paramList = this.getParamTypeList();
        this.paramSettings.text = "Выберите тип уставки";
        break;
    case Chart_Type.CT_DEVICE_ITEM:
        this.itemList = this.getDevItemList();
        this.settings.text = "Выберите элемент";
        this.settings.groupBy = "category";

        this.paramList = this.getParamList();
        this.paramSettings.text = "Выберите уставку";
        break;
    default:
        break;
    }
  }

  getPrefixObj(sct: Section, group: Device_Item_Group): any {
    let prefix = '';
    let category;
    if (this.schemeService.scheme.section.length > 1) {
      category = sct.name;
      prefix = (group.title || group.type.title) + ' - ';
    } else {
      category = group.title || group.type.title;
    }
    return {prefix, category};
  }

  getDevItemList(): any[] {
    let devItemList = [];
    for (const sct of this.schemeService.scheme.section) {
      for (const group of sct.groups) {
        const po = this.getPrefixObj(sct, group);

        for (const item of group.items) {
          const title = po.prefix + (item.name || item.type.title);
          devItemList.push({id: item.id, title, category: po.category});
        }
      }
    }

    return devItemList;
  }

  getParamTypeList(): any[] {
    let paramList = [];
    const param_types = this.schemeService.scheme.dig_param_type;
    for (const pt of param_types)
    {
      if (pt.value_type >= DIG_Param_Value_Type.VT_RANGE
          || pt.value_type <= DIG_Param_Value_Type.VT_UNKNOWN)
        continue;

      let category = '?';
      for (const dig_type of this.schemeService.scheme.dig_type) {
        if (dig_type.id === pt.group_type_id) {
          category = dig_type.title;
          break;
        }
      }

      let title = pt.title;
      if (pt.parent_id) {
        for (const p_pt of param_types) {
          if (p_pt.id === pt.parent_id) {
            title = p_pt.title + ' - ' + title;
            break;
          }
        }
      }

      paramList.push({id: pt.id, title, category});
    }

    return paramList;
  }

  getParamList(): any[] {
    let paramList = [];
    for (const sct of this.schemeService.scheme.section) {
      for (const group of sct.groups) {
        const po = this.getPrefixObj(sct, group);

        for (const prm of group.params) {
          const title = po.prefix + prm.param.title;
          paramList.push({id: prm.id, title, category: po.category});
        }
      }
    }

    return paramList;
  }

  adjust_stepped(dataset: any, y_min: number, y_max: number): void {
    if (dataset.hidden || !dataset.steppedLine || !dataset.data.length || !dataset.dev_item)
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

  initCharts(): void 
  {
    if (!this.selectedItems.length) {
      console.log('Init charts failed', this.charts_type, this.selectedItems);
      return;
    }

    this.charts = [];

    let data_ptr = { dev_items: [], params: [] };

    switch(this.charts_type)
    {
    case Chart_Type.CT_DIG_TYPE:
        this.initDIGTypeCharts(data_ptr);
        break;
    case Chart_Type.CT_DEVICE_ITEM_TYPE:
        this.initDeviceItemTypeCharts(data_ptr);
        break;
    case Chart_Type.CT_DEVICE_ITEM:
        this.initDeviceItemCharts(data_ptr);
        break;
    default:
        break;
    }

    this.data_ = data_ptr.dev_items.join(',');
    this.param_data_ = data_ptr.params.join(',');

    this.time_from_ = parseDate(this.date_from, this.time_from);
    this.time_to_ = parseDate(this.date_to, this.time_to);
    this.is_today = new Date().getTime() < this.time_to_;

    this.prgMode = 'indeterminate';
    this.prgValue = 0;
    this.prgValue2 = 0;
    this.logs_count = 0;
    this.logs_count2 = 0;
    this.initialized = false;
    this.values_loaded = false;
    this.params_loaded = false;
    this.getParamData();
    this.getLogs();
  }

  addParam2Dataset(datasets: any[], data: any, params: DIG_Param_Value[], is_pt: boolean = true): void {
    for (const prm of params) {
      const prm_id = is_pt ? prm.param_id : prm.id;
      for (const s_pt of this.paramSelected) {
        if (s_pt.id === prm_id) {
          data.params.push(prm.id);
          datasets.push(this.genParamDataset(prm));
          break;
        }
      }

      if (prm.childs)
        this.addParam2Dataset(datasets, data, prm.childs);
    }
  }

  initDIGTypeCharts(data: any): void {
    const sections = this.schemeService.scheme.section;
    for (const sct of sections) {
      for (const group of sct.groups) {
        if (group.type_id === this.selectedItems[0].id) {
          const datasets: any[] = [];

          for (const item of group.items) {
            if (item.type.save_algorithm > Save_Algorithm.SA_OFF) {
              data.dev_items.push(item.id);
              datasets.push(this.genDevItemDataset(item));
            }
          }

          this.addParam2Dataset(datasets, data, group.params);

          this.addChart(sct.name, datasets);
          break;
        }
      }
    }
  }

  initDeviceItemTypeCharts(data: any): void {
    const sections = this.schemeService.scheme.section;
    for (const sct of sections) {
      for (const group of sct.groups) {
        const datasets: any[] = [];
        for (const item of group.items) {
          for (const type of this.selectedItems) {
            if (type.id == item.type.id) {
              data.dev_items.push(item.id);
              datasets.push(this.genDevItemDataset(item));
              break;
            }
          }
        }

        this.addParam2Dataset(datasets, data, group.params);

        if (datasets.length) {
          this.addChart(sct.name, datasets);
        }
      }
    }
  }

  initDeviceItemCharts(data: any): void {
    const datasets: any[] = [];
    const sections = this.schemeService.scheme.section;
    for (const sct of sections) {
      for (const group of sct.groups) {
        for (const item of group.items) {
          for (const s_item of this.selectedItems) {
            if (s_item.id == item.id) {
              data.dev_items.push(item.id);
              datasets.push(this.genDevItemDataset(item));
              break;
            }
          }
        }

        this.addParam2Dataset(datasets, data, group.params, false);
      }
    }
    this.addChart(this.translate.instant('REPORTS.CHARTS_ELEMENTS'), datasets);
  }

  addChart(name: string, datasets: any[]): void {
    if (datasets.length) {
      datasets[0].hidden = false;
    }
    this.charts.push({
      name, 
      data: {datasets},

      min_y: 9999, 
      max_y: -9999,
    });
  }

  set_initialized(set_values_loaded: boolean): void {
    if (set_values_loaded)
      this.values_loaded = true;
    else
      this.params_loaded = true;

    if (this.values_loaded && this.params_loaded) {
      for (const chart of this.charts) 
        for (const dataset of chart.data.datasets)
          this.adjust_stepped(dataset, chart.min_y, chart.max_y);

      const x = new Date();
      if (this.is_today)
      {
        for (const chart of this.charts) 
        {
          for (const dataset of chart.data.datasets)
          {
            const log = dataset.dev_item ? dataset.dev_item.val : dataset.param;
            const y = this.getY(chart, log);
            if (y !== undefined)
              dataset.data.push({x, y});
          }
        }
      }

      this.initialized = true;
    }
  }

  getY(chart: any, log: any): any {
    let y;

    const v_type = typeof log.value;
    if (v_type === 'number' || v_type === 'boolean') {
      y = log.value;
    } else {
      const v2_type = typeof log.raw_value;
      if (v2_type === 'number' || v2_type === 'boolean')
        y = log.raw_value;
    }
    // console.log(`Finded log ${log.item_id} val: ${log.value} date: ${log.timestamp_msecs} t: ${typeof log.timestamp_msecs}`, typeof log.value, log);
    // if (log.value == null || /^(\-|\+)?([0-9]+|Infinity)$/.test(log.value))

    if (y !== undefined) {
      if (chart.min_y > y)
        chart.min_y = y;
      if (chart.max_y < y)
        chart.max_y = y;
    }
    return y;
  }

  getParamData(limit: number = 1000, offset: number = 0): void {
    if (this.param_data_.length) {
      this.schemeService.getChartParamData(this.time_from_, this.time_to_, this.param_data_, limit, offset)
        .subscribe((logs: PaginatorApi<Log_Param>) => this.fillParamData(logs));
    } else {
      this.params_loaded = true;
    }
  }

  fillParamData(logs: PaginatorApi<Log_Param>): void {
    if (!logs)
    {
      this.set_initialized(false);
      return;
    }

    this.addLogData(logs);

    this.logs_count2 += logs.results.length;
    this.prgValue2 = this.logs_count2 / (logs.count / 100.0);

    const need_more: boolean = logs.count > this.logs_count2 && this.logs_count2 < 100000;
    if (need_more)
    {
      this.prgMode = 'determinate';
      console.warn(`Log param count: ${logs.count} on page: ${logs.results.length} current: ${this.logs_count2}`);

      const start = this.logs_count2;
      const limit = logs.count - this.logs_count2;
      this.getParamData(limit < 1000 ? limit : 1000, this.logs_count2);
    }
    else
      this.set_initialized(false);
  }

  pushDataset(log: any): void {
    for (const chart of this.charts) {
      for (const dataset of chart.data.datasets) {
        if ((dataset.dev_item && dataset.dev_item.id === log.item_id)
            || (dataset.param && dataset.param.id === log.group_param_id)) {
          const y = this.getY(chart, log);
          if (y === undefined)
            return;

          const x = new Date(log.timestamp_msecs);
          dataset.data.push({x, y});
          return;
        }
      }
    }
  }

  addLogData(logs: any): void {
    for (const log of logs.results)
      this.pushDataset(log);
  }

  getLogs(limit: number = 1000, offset: number = 0): void {
    this.schemeService.getChartData(this.time_from_, this.time_to_, this.data_, limit, offset)
      .subscribe((logs: PaginatorApi<Log_Value>) => this.fillData(logs));
  }

  fillData(logs: PaginatorApi<Log_Value>): void {
    if (!logs)
    {
      this.set_initialized(true);
      return;
    }

    this.addLogData(logs);

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
    else
      this.set_initialized(true);
  }

  breakLoad(): void {
    this.logs_count *= 100 / this.prgValue;
    this.logs_count2 *= 100 / this.prgValue2;
  }

  genDateString(date: Date, time: string): string {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    let date_str: string = date.getFullYear().toString();
    date_str += `-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day} `;
    return date_str + time;
  }

  genDevItemDataset(item: Device_Item): Object {
    // const rndRGB = `${this.randomColorFactor()},${this.randomColorFactor()},${this.randomColorFactor()}`;

    const label = item.name.length ? item.name : item.type.title;

    const RT = Register_Type;
    const rt = item.type.register_type;
    const stepped = rt === RT.RT_COILS || rt === RT.RT_DISCRETE_INPUTS;

    let dataset = this.genDataset(label, stepped);
    dataset['dev_item'] = item;
    return dataset;
  }

  genParamDataset(param: DIG_Param_Value): Object {
    let dataset = this.genDataset('⚙️ ' + param.param.title);
    dataset['param'] = param;
    return dataset;
  }

  genDataset(label: string, steppedLine: boolean = true): Object {
    const rndRGB = this.intToRGB(this.hashCode(label));

    return {
      label,
      data: [],

      borderColor: `rgba(${rndRGB},0.4)`,
      backgroundColor: `rgba(${rndRGB},0.5)`,
      pointBorderColor: `rgba(${rndRGB},0.7)`,
      pointBackgroundColor: `rgba(${rndRGB},0.5)`,
      pointBorderWidth: 1,

      hidden: false,
      fill: steppedLine,
      steppedLine,
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
