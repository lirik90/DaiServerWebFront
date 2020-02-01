import {AfterViewInit, Component, OnInit, QueryList, ViewChildren, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';

import {SchemeService, ExportConfig, ExportItem} from '../../scheme.service';
import {Device_Item_Type, DIG_Type, Section, Device_Item, Log_Data, Register_Type} from '../../scheme';
import {PaginatorApi} from '../../../user';
import {TranslateService} from '@ngx-translate/core';
import { BaseChartDirective } from 'ng2-charts';
// import {ChartComponent} from 'angular2-chartjs';

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

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css']
})
export class ChartsComponent implements OnInit, AfterViewInit {
  date_from = new FormControl(new Date());
  time_from = '00:00:00';
  date_to = new FormControl(new Date());
  time_to = '23:59:59';

  @ViewChild("chart_obj", {static: false}) chart: BaseChartDirective;

  charts_type = 0;

  group_types: DIG_Type[];
  selected_group_type: DIG_Type;

  item_types: Device_Item_Type[];
  selected_item_types: DevItemTypeItem[] = [];

  devitems: DevItemItem[] = [];
  selected_devitems: DevItemTypeItem[] = [];

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

    this.item_types = this.schemeService.scheme.device_item_type;
    for (const sct of this.schemeService.scheme.section) {
      for (const group of sct.groups) {
        for (const item of group.items) {
          this.devitems.push({id: item.id, name: sct.name + ' ' + group.title + ' ' + (item.name || item.type.title)});
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

  add_item_type(): void {
    this.selected_item_types.push({id: 0});
  }

  del_item_type(item: DevItemTypeItem): void {
    const i = this.selected_item_types.indexOf(item);
    if (i !== -1) {
      this.selected_item_types.splice(i, 1);
    }
  }

  add_devitem(): void {
    this.selected_devitems.push({id: 0});
  }

  del_devitem(item: DevItemTypeItem): void {
    const i = this.selected_devitems.indexOf(item);
    if (i !== -1) {
      this.selected_devitems.splice(i, 1);
    }
  }

  getLogs(): void {
  }

  initCharts(): void {
    if ((this.charts_type === 0 && !this.selected_group_type) || (this.charts_type === 1 && this.selected_item_types.length === 0)) {
      return;
    }
    let itemtypes_str: string;
    if (this.charts_type === 1) {
      const itemtypes: number[] = [];
      for (const item of this.selected_item_types) {
        if (item.id) {
          itemtypes.push(item.id);
        }
      }
      if (itemtypes.length === 0) {
        return;
      }
      itemtypes_str = itemtypes.join(',');
    }

    let devitems_str: string;
    if (this.charts_type === 2) {
      const devitems: number[] = [];
      for (const item of this.selected_devitems) {
        if (item.id) {
          devitems.push(item.id);
        }
      }
      if (devitems.length === 0) {
        return;
      }
      devitems_str = devitems.join(',');
    }

    this.charts = [];
    this.initialized = false;

    const dtstr_from = (<Date>this.date_from.value).toDateString() + ' ' + this.time_from;
    const date_from = Date.parse(dtstr_from);

    const dtstr_to = (<Date>this.date_to.value).toDateString() + ' ' + this.time_to;
    const date_to = Date.parse(dtstr_to);
    let count: number;

    const fillData = (logs: PaginatorApi<Log_Data>) => {
      if (!count && logs.count > logs.results.length) {
        console.warn(`Log count: ${logs.count} on page: ${logs.results.length}`);

        count = logs.count;
        const start = logs.results.length;
        const limit = logs.count - start;
        if (this.charts_type === 0) {
          this.schemeService.getLogs(
            date_from,
            date_to,
            this.selected_group_type.id,
            undefined,
            undefined,
            limit,
            start
          ).subscribe(fillData);
        } else if (this.charts_type === 1) {
          this.schemeService.getLogs(date_from, date_to, undefined, itemtypes_str, undefined, limit, start).subscribe(fillData);
        } else {
          this.schemeService.getLogs(date_from, date_to, undefined, undefined, devitems_str, limit, start).subscribe(fillData);
        }
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

      for (const chart of this.charts) 
        for (const dataset of chart.data.datasets)
          this.adjust_stepped(dataset, min_y, max_y);

      this.initialized = true;
    };

    if (this.charts_type === 0) {
      const sections = this.schemeService.scheme.section;
      for (const sct of sections) {
        for (const group of sct.groups) {
          if (group.type_id === this.selected_group_type.id) {
            const datasets: any[] = [];

            for (const item of group.items) {
              datasets.push(this.genDataset(item));
            }

            this.addChart(sct.name, datasets);
            break;
          }
        }
      }
      this.schemeService.getLogs(date_from, date_to, this.selected_group_type.id, undefined, undefined).subscribe(fillData);
    } else if (this.charts_type === 1) {
      const sections = this.schemeService.scheme.section;
      for (const sct of sections) {
        for (const group of sct.groups) {
          const datasets: any[] = [];
          for (const item of group.items) {
            for (const it of this.selected_item_types) {
              if (it.id === item.type.id) {
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
      this.schemeService.getLogs(date_from, date_to, undefined, itemtypes_str, undefined).subscribe(fillData);
    } else {
      const datasets: any[] = [];
      const sections = this.schemeService.scheme.section;
      for (const sct of sections) {
        for (const group of sct.groups) {
          for (const item of group.items) {
            for (const it of this.selected_devitems) {
              if (it.id === item.id) {
                datasets.push(this.genDataset(item, true));
                break;
              }
            }
          }
        }
      }
      this.addChart(this.translate.instant('REPORTS.CHARTS_ELEMENTS'), datasets);
      this.schemeService.getLogs(date_from, date_to, undefined, undefined, devitems_str).subscribe(fillData);
    }
  }

  addChart(name: string, datasets: any[]): void {
    if (datasets.length) {
      datasets[0].hidden = false;
    }
    this.charts.push({name, data: {datasets}});
  }

  genDateString(date: Date, time: string): string {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    let date_str: string = date.getFullYear().toString();
    date_str += `-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day} `;
    return date_str + time;
  }

  genDataset(item: Device_Item, add_sct_name: boolean = false): Object {
    const rndRGB = `${this.randomColorFactor()},${this.randomColorFactor()},${this.randomColorFactor()}`;

    const RT = Register_Type;
    const rt = item.type.register_type;
    const stepped = rt === RT.RT_COILS || rt === RT.RT_DISCRETE_INPUTS;

    return {
      item_id: item.id,
      label: item.name.length ? item.name : item.type.title,
      data: [],

      borderColor: `rgba(${rndRGB},0.4)`,
      backgroundColor: `rgba(${rndRGB},0.5)`,
      pointBorderColor: `rgba(${rndRGB},0.7)`,
      pointBackgroundColor: `rgba(${rndRGB},0.5)`,
      pointBorderWidth: 1,

      hidden: false,
      steppedLine: stepped,
      cubicInterpolationMode: 'monotone',
      //      lineTension: 0,
    };
  }

  randomColorFactor(): number {
    return Math.round(Math.random() * 255);
  }

  randomColor(opacity: number): string {
    return `rgba(${this.randomColorFactor()},${this.randomColorFactor()},${this.randomColorFactor()},${opacity || '.3'})`;
  }
}
