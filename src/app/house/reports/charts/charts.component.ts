import {AfterViewInit, Component, OnInit, QueryList, ViewChildren} from '@angular/core';
import { FormControl } from '@angular/forms';

import { HouseService, ExportConfig, ExportItem } from "../../house.service";
import { ItemType, GroupType, Section, DeviceItem, Logs } from "../../house";
import { PaginatorApi } from "../../../user";
import {TranslateService} from '@ngx-translate/core';
import {ChartComponent} from 'angular2-chartjs';

interface DevItemTypeItem {
  id: number;
}
interface DevItemItem extends DevItemTypeItem {  name: string;
}

interface Chart {
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
  time_from: string = '00:00:00';
  date_to = new FormControl(new Date());
  time_to: string = '23:59:59';

  charts_type: number = 0

  group_types: GroupType[];
  selected_group_type: GroupType;

  item_types: ItemType[];
  selected_item_types: DevItemTypeItem[] = [];

  devitems: DevItemItem[] = [];
  selected_devitems: DevItemTypeItem[] = [];

  charts: Chart[] = [];

  type = 'line';
  options = {
    responsive: true,
    legend: {
      display: false,
      //position: 'bottom',
    },
    maintainAspectRatio: false,
    tooltips: {
      mode: 'label',
      callbacks: {
        // title: function(itemList, data) { // args: Array[tooltipItem], data
        // // Тут можно сделать обработку даты
        // // console.log(data);
        // return data;
        // },
        // label: function(item, data) { // args: tooltipItem, data
        // console.log(item);
        // },
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
      mode: 'label'
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

  initialized: boolean = false;

  ngAfterViewInit() {
  }

  constructor(
	  public translate: TranslateService,
    private houseService: HouseService,
  ) { }

  ngOnInit() {
    this.group_types = this.houseService.house.groupTypes;
    if (this.group_types && this.group_types.length)
      this.selectGroup(this.group_types[0]);

    this.item_types = this.houseService.house.itemTypes;
    for (const sct of this.houseService.house.sections) {
      for (const group of sct.groups) {
        for (const item of group.items) {
          this.devitems.push({ id: item.id, name: sct.name + ' ' + (item.name || item.type.title) });
        }
      }
    }

    this.initCharts();

  }

  selectGroup(group_type: GroupType): void {
    if (this.selected_group_type && this.selected_group_type.id == group_type.id)
    return;
    this.selected_group_type = group_type;
  }

  add_item_type(): void {
    this.selected_item_types.push({ id: 0 });
  }
  del_item_type(item: DevItemTypeItem): void {
    const i = this.selected_item_types.indexOf(item);
    if (i !== -1)
    this.selected_item_types.splice(i, 1);
  }

  add_devitem(): void {
    this.selected_devitems.push({ id: 0 });
  }
  del_devitem(item: DevItemTypeItem): void {
    const i = this.selected_devitems.indexOf(item);
    if (i !== -1)
    this.selected_devitems.splice(i, 1);
  }

  getLogs(): void {
  }

  initCharts(): void {
    if ((this.charts_type == 0 && !this.selected_group_type) || (this.charts_type == 1 && this.selected_item_types.length == 0))
      return;
    let itemtypes_str: string;
    if (this.charts_type == 1) {
      let itemtypes: number[] = [];
      for (const item of this.selected_item_types)
        if (item.id)
          itemtypes.push(item.id);
      if (itemtypes.length == 0)
        return;
      itemtypes_str = itemtypes.join(',');
    }

    let devitems_str: string;
    if (this.charts_type == 2) {
      let devitems: number[] = [];
      for (const item of this.selected_devitems)
        if (item.id)
          devitems.push(item.id);
      if (devitems.length == 0)
        return;
      devitems_str = devitems.join(',');
    }

    this.charts = [];
    this.initialized = false;

    let date_from = this.genDateString(this.date_from.value, this.time_from);
    let date_to = this.genDateString(this.date_to.value, this.time_to);
    let count: number;

    let fillData = (logs: PaginatorApi<Logs>) => {
      if (!count && logs.count > logs.results.length) {
        console.warn(`Log count: ${logs.count} on page: ${logs.results.length}`);

        count = logs.count;
        const start = logs.results.length;
        const limit = logs.count - start;
        if (this.charts_type == 0)
          this.houseService.getLogs(date_from, date_to, this.selected_group_type.id, undefined, undefined, limit, start).subscribe(fillData);
        else if (this.charts_type == 1)
          this.houseService.getLogs(date_from, date_to, undefined, itemtypes_str, undefined, limit, start).subscribe(fillData);
        else
          this.houseService.getLogs(date_from, date_to, undefined, undefined, devitems_str, limit, start).subscribe(fillData);
      }

      let finded: boolean;

      for (const log of logs.results) {
        finded = false;

        for (let chart of this.charts) {
          for (let dataset of chart.data.datasets) {
            if (dataset.item_id == log.item_id) {
              // console.log(`Finded log ${log.item_id} val: ${log.value} date: ${log.date} t: ${typeof log.date}`);
              //              if (log.value == null || /^(\-|\+)?([0-9]+|Infinity)$/.test(log.value))
              dataset.data.push({ x: new Date(log.date), y: log.value });
              finded = true;
              break;
            }
          }
          if (finded) break;
        }
      }

      this.initialized = true;
    };

    if (this.charts_type == 0) {
      const sections = this.houseService.house.sections;
      for (const sct of sections) {
        for (const group of sct.groups) {
          if (group.type_id == this.selected_group_type.id) {
            let datasets: any[] = [];

            for (const item of group.items) {
              datasets.push(this.genDataset(item));
            }

            this.addChart(sct.name, datasets);
            break;
          }
        }
      }
      this.houseService.getLogs(date_from, date_to, this.selected_group_type.id, undefined, undefined).subscribe(fillData);
    } else if (this.charts_type == 1) {
      const sections = this.houseService.house.sections;
      for (const sct of sections) {
        for (const group of sct.groups) {
          let datasets: any[] = [];
          for (const item of group.items) {
            for (const it of this.selected_item_types) {
              if (it.id == item.type.id) {
                datasets.push(this.genDataset(item));
                break;
              }
            }
          }

          if (datasets.length)
            this.addChart(sct.name, datasets);
        }
      }
      this.houseService.getLogs(date_from, date_to, undefined, itemtypes_str, undefined).subscribe(fillData);
    } else {
      let datasets: any[] = [];
      const sections = this.houseService.house.sections;
      for (const sct of sections) {
        for (const group of sct.groups) {
          for (const item of group.items) {
            for (const it of this.selected_devitems) {
              if (it.id == item.id) {
                datasets.push(this.genDataset(item, true));
                break;
              }
            }
          }
        }
      }
      this.addChart(this.translate.instant("REPORTS.CHARTS_ELEMENTS"), datasets);
      this.houseService.getLogs(date_from, date_to, undefined, undefined, devitems_str).subscribe(fillData);
    }
  }

  addChart(name: string, datasets: any[]): void {
    if (datasets.length)
      datasets[0].hidden = false;
    this.charts.push({ name, data: { datasets } });
  }

  genDateString(date: Date, time: string): string {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    let date_str: string = date.getFullYear().toString();
    date_str += `-${month<10?'0':''}${month}-${day<10?'0':''}${day} `;
    return date_str + time;
  }

  genDataset(item: DeviceItem, add_sct_name: boolean = false): Object {
    return {
      item_id: item.id,
      label: item.name.length ? item.name : item.type.title,
      data: [],

      borderColor: this.randomColor(0.4),
      backgroundColor: this.randomColor(0.5),
      pointBorderColor: this.randomColor(0.7),
      pointBackgroundColor: this.randomColor(0.5),
      pointBorderWidth: 1,

      hidden: true,
      //      steppedLine: true,
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
