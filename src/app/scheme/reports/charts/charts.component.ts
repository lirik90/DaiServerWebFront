import {AfterViewInit, Component, OnInit, QueryList, ViewChildren, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';

import { MatDialog } from '@angular/material/dialog';

import {
  MAT_MOMENT_DATE_FORMATS,
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

import { TranslateService } from '@ngx-translate/core';
import { BaseChartDirective } from 'ng2-charts';
// import {ChartComponent} from 'angular2-chartjs';

import * as moment from 'moment';
// import * as _moment from 'moment';
// import {default as _rollupMoment} from 'moment';
// const moment = _rollupMoment || _moment;

import { SchemeService, ExportConfig, ExportItem, Paginator_Chart_Value } from '../../scheme.service';
import { Device_Item_Type, DIG_Param, DIG_Type, Section, Device_Item, Log_Value, Log_Param, Register_Type, Save_Algorithm, DIG_Param_Value_Type, Device_Item_Group, Chart } from '../../scheme';
import { PaginatorApi } from '../../../user';

import { ColorPickerDialog } from './color-picker-dialog/color-picker-dialog';

interface Chart_Info_Interface {
  name: string;
  data: {
    datasets: any[]
  };

  min_y: number;
  max_y: number;
}

interface Chart_Item_Iface
{
    id: number;
    color: string;
}

interface Select_Item_Iface
{
    id: number;
    title: string;
    category: string;
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

  @ViewChild("chart_obj") chart: BaseChartDirective;

  charts_type: number = Chart_Type.CT_USER;
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

    paramList: Select_Item_Iface[] = [];
    paramSelected: Select_Item_Iface[] = [];
  paramSettings: any = {};

  charts: Chart_Info_Interface[] = [];

  values_loaded: boolean;
  params_loaded: boolean;
  initialized = false;

    user_chart: Chart;
    user_charts: Chart[] = [];

    data_part_size: number = 100000;

  type = 'line';
  options = {
      elements: { point: { radius: 0 } },
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
        label: function(item, data) { // args: tooltipItem, data
          // console.log('callback label:', item, data);
          const dataset = data.datasets[item.datasetIndex];
          const text = dataset.steppedLine && dataset.dev_item ?
            (item.yLabel < dataset["my_cond"] ? '0' : '1') :
            item.value;
          return dataset.label + ": " + text;
        },
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
      private dialog: MatDialog
  ) {
  }

  ngOnInit() {
      this.schemeService.get_charts().subscribe(charts => {
          this.user_charts = charts;
          if (!this.user_charts.length)
              this.charts_type = Chart_Type.CT_DIG_TYPE;

          this.OnChartsType();
          this.initCharts();
      });
  }

    onItemSelect(item: any): void
    {
        if (this.charts_type === Chart_Type.CT_DIG_TYPE)
        {
            const accepted_param_type_ids = this.schemeService.scheme.dig_param_type
                .filter(param_type => param_type.group_type_id === item.id)
                .map(param_type => param_type.id);

            this.paramSelected = [];
            this.paramList = this.getParamTypeList().filter((param_type: Select_Item_Iface) => 
            {
                return accepted_param_type_ids.includes(param_type.id);
            });
        }
    }

  OnChartsType(user_chart: Chart = undefined): void {
    if (user_chart)
        this.user_chart = { ...user_chart };
    else
        this.user_chart = { id: 0, name: '' } as Chart;

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
    case Chart_Type.CT_USER:
        this.itemList = this.user_charts;
        if (this.itemList.length)
          this.selectedItems.push(this.itemList[0]);
        this.settings.text = "Выберите график";
        this.settings.singleSelection = true;
        this.settings.labelKey = 'name';

        this.paramList = null;

        break;
    case Chart_Type.CT_DIG_TYPE:
        this.itemList = this.schemeService.scheme.dig_type;
        if (this.itemList.length)
        {
            this.selectedItems.push(this.itemList[0]);
            this.onItemSelect(this.selectedItems[0]);
        }
        this.settings.text = "Выберите тип группы";
        this.settings.singleSelection = true;

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

  getDevItemList(): Select_Item_Iface[] {
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

  getParamTypeList(): Select_Item_Iface[] {
    let paramList: Select_Item_Iface[] = [];
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

  getParamList(): Select_Item_Iface[] 
  {
      let paramList: Select_Item_Iface[] = [];

      let add_param = (p: DIG_Param, category: string = '') => 
      {
          if (p.childs && p.childs.length)
          {
              const new_category = category + ' - ' + p.param.title;
              for (const p1 of p.childs)
                  add_param(p1, new_category);
          }
          else
              paramList.push({id: p.id, title: p.param.title, category});
      };

      for (const sct of this.schemeService.scheme.section) {
        for (const group of sct.groups) {
          const po = this.getPrefixObj(sct, group);

          for (const prm of group.params)
              add_param(prm, po.category + po.prefix);
        }
      }

      return paramList;
  }

    adjust_stepped(dataset: any, y_min: number, y_max: number): void
    {
        if (dataset.hidden || !dataset.steppedLine || !dataset.data.length || !dataset.dev_item)
            return;
        
        const pr = (y_max - y_min) * 0.1;
        const y0 = y_min + pr;
        const y1 = y_max - pr;

        dataset["my_cond"] = y1;

        let cond;
        let finded = false;
        for (let item of dataset.data)
        {
            if (item.y !== null)
            {
                if (cond === undefined)
                    cond = item.y;
                else if (item.y !== cond)
                {
                    finded = true;
                    if (item.y > cond)
                        cond = item.y;
                    break;
                }
            }
        }

        if (!finded && cond == 0)
            cond = 1;

        for (let item of dataset.data)
            item.y = item.y < cond ? y0 : y1;
    }

  random_color(): void {
    for (const data of (<any>this.chart.data).datasets) {
      const rgb_str = `${this.randomColorFactor()},${this.randomColorFactor()},${this.randomColorFactor()}`;
      data.borderColor = `rgba(${rgb_str},0.4)`;
      data.backgroundColor = `rgba(${rgb_str},0.5)`;
      data.pointBorderColor = `rgba(${rgb_str},0.7)`;
      data.pointBackgroundColor = `rgba(${rgb_str},0.5)`;
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
    case Chart_Type.CT_USER:
        this.initDeviceItemUserCharts(data_ptr);
        break;
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
    this.getParamData(this.data_part_size);
    this.getLogs(this.data_part_size);
  }

  addParam2Dataset(datasets: any[], data: any, params: DIG_Param[], selected: Chart_Item_Iface[]): void {
    for (const param of params) {
      for (const s_pt of selected) {
        if (s_pt.id === param.id) {
          data.params.push(param.id);
          datasets.push(this.genParamDataset(param, s_pt.color));
          break;
        }
      }

      if (param.childs)
        this.addParam2Dataset(datasets, data, param.childs, selected);
    }
  }

    get_dig_param_ids(param_types: any[]): Chart_Item_Iface[]
    {
        console.log(param_types);
        const get_param_id = (param_type_id: number): number =>
        {
            const find_param = (params: DIG_Param[], type_id: number) =>
            {
                if (params)
                    for (const param of params)
                    {
                        if (param.param_id === type_id)
                            return param.id;

                        const param_id = find_param(param.childs, type_id);
                        if (param_id)
                            return param_id;
                    }
                return null;
            };

            console.log('Search param type id: ' + param_type_id);
            for (const sct of this.schemeService.scheme.section)
            {
                for (const group of sct.groups)
                {
                    const param_id = find_param(group.params, param_type_id);
                    if (param_id)
                        return param_id;
                }
            }
            console.log('Search param type id: ' + param_type_id + ' failed', this.schemeService.scheme.section);
            return null;
        };

        let res = [];
        for (const param_type of param_types)
        {
            const dig_param_id = get_param_id(param_type.id);
            if (dig_param_id)
                res.push({id: dig_param_id, color: null });
        }

        return res;
    }

    initDIGTypeCharts(data: any): void {
        const params = this.get_dig_param_ids(this.paramSelected);
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
    
              this.addParam2Dataset(datasets, data, group.params, params);
    
              this.addChart(sct.name, datasets);
              break;
            }
          }
        }
    }

    initDeviceItemTypeCharts(data: any): void {
        const params = this.get_dig_param_ids(this.paramSelected);
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

            this.addParam2Dataset(datasets, data, group.params, params);

            if (datasets.length) {
              this.addChart(sct.name, datasets);
            }
          }
        }
    }

  initDeviceItemChartsImpl(data: any, dev_items: Chart_Item_Iface[], params: Chart_Item_Iface[]): void {
    const datasets: any[] = [];
    const sections = this.schemeService.scheme.section;
    for (const sct of sections) {
      for (const group of sct.groups) {
        for (const item of group.items) {
          for (const s_item of dev_items) {
            if (s_item.id == item.id) {
              data.dev_items.push(item.id);
              datasets.push(this.genDevItemDataset(item, s_item.color));
              break;
            }
          }
        }

        this.addParam2Dataset(datasets, data, group.params, params);
      }
    }
    this.addChart(this.translate.instant('REPORTS.CHARTS_ELEMENTS'), datasets);
  }

    initDeviceItemCharts(data: any): void 
    {
        const items = this.selectedItems.map(it => { return {id: it.id, color: null}; });
        const params = this.paramSelected.map(it => { return {id: it.id, color: null}; });
        this.initDeviceItemChartsImpl(data, items, params);
    }

    initDeviceItemUserCharts(data: any): void 
    {
        const hex2rgb_str = (color: string): string =>
        {
            if (!color)
                return `${this.randomColorFactor()},${this.randomColorFactor()},${this.randomColorFactor()}`;

            const r = parseInt(color.substr(1,2), 16);
            const g = parseInt(color.substr(3,2), 16);
            const b = parseInt(color.substr(5,2), 16);
            if (isNaN(r) || isNaN(g) || isNaN(b))
                return `${this.randomColorFactor()},${this.randomColorFactor()},${this.randomColorFactor()}`;

            return r + ',' + g + ',' + b;
        };

        const user_chart = this.selectedItems[0];
        let items = [];
        let params = [];
        for (const it of user_chart.items)
        {
            if (it.item_id)
                items.push({id: it.item_id, color: hex2rgb_str(it.color)});
            else
                params.push({id: it.param_id, color: hex2rgb_str(it.color)});
        }

        //const ids = [...new Set(user_chart.items.map(it => it.item_id))];
        this.initDeviceItemChartsImpl(data, items, params);
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

        if (this.values_loaded && this.params_loaded)
        {
            if (this.is_today)
            {
                const x = new Date();
                for (const chart of this.charts) 
                {
                    for (const dataset of chart.data.datasets)
                    {
                        const log = dataset.dev_item ? dataset.dev_item.val : dataset.param;
                        const y = this.getY(chart, log, dataset.steppedLine);
                        if (y !== undefined && y !== null)
                        {
                            if (dataset.data.length === 0)
                            {
                                const x0 = new Date(this.time_from_);
                                dataset.data.push({x: x0, y});
                            }
                            dataset.data.push({x, y});
                        }
                    }
                }
            }

            for (const chart of this.charts) 
                for (const dataset of chart.data.datasets)
                    this.adjust_stepped(dataset, chart.min_y, chart.max_y);

            this.initialized = true;
        }
    }

    getY(chart: any, log: any, is_stepped: boolean): any {
        let y = log.value;
        if (y == undefined || y == null)
            return null;

        if (typeof y === 'string')
        {
            if (/^(\-|\+)?([0-9\.]+|Infinity)$/.test(y))
                return parseFloat(y);

            if (is_stepped)
                return y;

            const v2_type = typeof log.raw_value;
            if (v2_type === 'number' || v2_type === 'boolean')
                y = log.raw_value;
            else
                y = y.length;
        }

        // console.log(`Finded log ${log.item_id} val: ${log.value} date: ${log.timestamp_msecs} t: ${typeof log.timestamp_msecs}`, typeof log.value, log);
        // if (log.value == null || /^(\-|\+)?([0-9]+|Infinity)$/.test(log.value))

        if (!is_stepped && y !== undefined)
        {
            if (chart.min_y > y)
                chart.min_y = y;
            if (chart.max_y < y)
                chart.max_y = y;
        }
        return y;
    }

    getParamData(limit: number, offset: number = 0): void {
        if (this.param_data_.length) {
            this.schemeService.getChartParamData(this.time_from_, this.time_to_, this.param_data_, limit, offset)
                .subscribe((logs: Paginator_Chart_Value) => this.fillParamData(logs));
        }
        else
          this.params_loaded = true;
    }

    fillParamData(logs: Paginator_Chart_Value): void {
        if (!logs)
        {
            this.set_initialized(false);
            return;
        }

        this.add_chart_data(logs, 'param');

        this.logs_count2 += logs.count;
        this.prgValue2 = this.logs_count2 / (logs.count_all / 100.0);

        const need_more: boolean = logs.count_all > this.logs_count2 && this.logs_count2 < 10000000;
        if (need_more)
        {
            this.prgMode = 'determinate';

            const start = this.logs_count2;
            const limit = logs.count_all - this.logs_count2;
            this.getParamData(limit < this.data_part_size ? limit : this.data_part_size, this.logs_count2);
        }
        else
            this.set_initialized(false);
    }


    find_dataset(data_param_name: string, data_id): [any, any]
    {
        for (const chart of this.charts)
            for (const dataset of chart.data.datasets)
                if (dataset[data_param_name] && dataset[data_param_name].id === data_id)
                    return [chart, dataset];
        return [null, null];
    }

    add_chart_data(logs: Paginator_Chart_Value, data_param_name: string)
    {
        for (const log of logs.results)
        {
            const [chart, dataset] = this.find_dataset(data_param_name, log.item_id);
            if (dataset)
            {
                for (const log_item of log.data)
                {
                    const y = this.getY(chart, log_item, dataset.steppedLine);
                    if (y !== undefined)
                    {
                        const x = new Date(log_item.time);
                        let data = {x, y};
                        if (log_item.user_id)
                        {
                            // This not working
                            // data['user_id'] = log_item.user_id;
                        }
                        dataset.data.push(data);
                    }
                }
            }
        }
    }

    getLogs(limit: number, offset: number = 0): void {
        this.schemeService.getChartData(this.time_from_, this.time_to_, this.data_, limit, offset)
            .subscribe((logs: Paginator_Chart_Value) => this.fillData(logs));
    }

    fillData(logs: Paginator_Chart_Value): void {
        if (!logs)
        {
            this.set_initialized(true);
            return;
        }

        this.add_chart_data(logs, 'dev_item');
        this.logs_count += logs.count;

        this.prgValue = this.logs_count / (logs.count_all / 100.0);

        const need_more: boolean = logs.count_all > this.logs_count && this.logs_count < 10000000;
        if (need_more)
        {
            this.prgMode = 'determinate';

            const start = this.logs_count;
            const limit = logs.count_all - this.logs_count;
            this.getLogs(limit < this.data_part_size ? limit : this.data_part_size, this.logs_count);
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

  genDevItemDataset(item: Device_Item, rgb_str: string = null): Object {
    // const rgb_str = `${this.randomColorFactor()},${this.randomColorFactor()},${this.randomColorFactor()}`;

    const label = item.name.length ? item.name : item.type.title;

    const RT = Register_Type;
    const rt = item.type.register_type;
    const stepped = rt === RT.RT_COILS || rt === RT.RT_DISCRETE_INPUTS;

    let dataset = this.genDataset(label, stepped, rgb_str);
    dataset['dev_item'] = item;
    return dataset;
  }

  genParamDataset(param: DIG_Param, rgb_str: string = null): Object {
    let dataset = this.genDataset('⚙️ ' + param.param.title, true, rgb_str);
    dataset['param'] = param;
    return dataset;
  }

  genDataset(label: string, steppedLine: boolean = true, rgb_str: string = null): Object {
      if (rgb_str === null)
          rgb_str = this.intToRGB(this.hashCode(label));
    // const rgb_str = this.intToRGB(this.hashCode(label));

    return {
      label,
      data: [],

      borderColor: `rgba(${rgb_str},0.8)`,
      backgroundColor: `rgba(${rgb_str},0.5)`,
      pointBorderColor: `rgba(${rgb_str},0.9)`,
      pointBackgroundColor: `rgba(${rgb_str},0.5)`,
      pointBorderWidth: 1,

      hidden: false,
      fill: false, //steppedLine,
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

    openColorPicker(chart: Chart_Info_Interface, dataset: any, chart_obj: any): void {
        const dialogRef = this.dialog.open(ColorPickerDialog, {
          width: '250px',
          data: {chart, dataset, chart_obj}
        });

        dialogRef.afterClosed().subscribe(color => {
            if (!color)
                return;

            const rgb_str = `${color.red},${color.green},${color.blue}`;
            dataset.borderColor = `rgba(${rgb_str},0.4)`;
            dataset.backgroundColor = `rgba(${rgb_str},0.5)`;
            dataset.pointBorderColor = `rgba(${rgb_str},0.7)`;
            dataset.pointBackgroundColor = `rgba(${rgb_str},0.5)`;

            this.chart.chart.update();
        });
    }

    del_user_chart(): void
    {
        const user_chart = this.selectedItems[0];

        this.schemeService.del_chart(user_chart).subscribe(is_removed => 
        {
            if (!is_removed)
                return;

            for (const chart_i in this.user_charts)
            {
                if (this.user_charts[chart_i].id === user_chart.id)
                {
                    this.user_charts.splice(parseInt(chart_i), 1);
                    break;
                }
            }

            this.selectedItems = [];
            if (this.user_charts.length)
                this.selectedItems.push(this.user_charts[0]);
        });
    }

    edit_user_chart(): void
    {
        const user_chart = this.selectedItems[0];

        this.charts_type = Chart_Type.CT_DEVICE_ITEM;
        this.OnChartsType(user_chart);

        this.selectedItems = this.itemList.filter(item => {
            for (const it of user_chart.items)
                if (item.id === it.item_id)
                    return true;
            return false;
        });

        this.paramSelected = this.paramList.filter(item => {
            for (const it of user_chart.items)
                if (item.id === it.param_id)
                    return true;
            return false;
        });
    }

    save_user_chart(): void
    {
        if (!this.user_chart.name.length)
            return;

        const chart = this.charts[0];
        const get_color = (item_id: number, param_id: number): string =>
        {
            for (const dataset of chart.data.datasets)
            {
                if (item_id !== null)
                {
                    if (dataset.dev_item && dataset.dev_item.id === item_id)
                        return ColorPickerDialog.rgba2hex(dataset.pointBorderColor);
                }
                else if (dataset.param && dataset.param.id === param_id)
                    return ColorPickerDialog.rgba2hex(dataset.pointBorderColor);
            }
            return '';
        };

        let user_chart = new Chart;
        user_chart.id = this.user_chart.id;
        user_chart.name = this.user_chart.name;
        user_chart.items = [];

        for (const item of this.selectedItems)
        {
            const chart_item = { color: get_color(item.id, null), item_id: item.id, param_id: null };
            user_chart.items.push(chart_item);
        }

        for (const item of this.paramSelected)
        {
            const chart_item = { color: get_color(null, item.id), item_id: null, param_id: item.id };
            user_chart.items.push(chart_item);
        }

        this.schemeService.save_chart(user_chart).subscribe(new_chart => 
        {
            for (let chart of this.user_charts)
            {
                if (chart.id === new_chart.id)
                {
                    chart.name = new_chart.name;
                    chart.items = new_chart.items;
                    return;
                }
            }

            this.user_charts.push(new_chart);
        });
    }

}
