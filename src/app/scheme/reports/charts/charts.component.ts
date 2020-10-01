import {Component} from '@angular/core';

import {ISubscription} from 'rxjs/Subscription';

import {TranslateService} from '@ngx-translate/core';
// import {ChartComponent} from 'angular2-chartjs';
import 'chartjs-plugin-zoom';

// import * as moment from 'moment';
// import * as _moment from 'moment';
// import {default as _rollupMoment} from 'moment';
// const moment = _rollupMoment || _moment;
import {Paginator_Chart_Value, SchemeService} from '../../scheme.service';
import {Chart, Device_Item, DIG_Param, Register_Type, Save_Algorithm} from '../../scheme';
import {Scheme_Group_Member} from '../../../user';
import {Chart_Info_Interface, Chart_Type, ChartFilter} from './chart-types';

interface Chart_Item_Iface
{
    id: number;
    color: string;
}

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css'],
  providers: [],
})
export class ChartsComponent {
//  date_from = new FormControl(new Date().toISOString().slice(0, -1));

  logs_count: number;
  logs_count2: number;

  data_: string;
  param_data_: string;
  time_from_: number;
  time_to_: number;
  is_today: boolean;

  devItemList = [];

  chartFilter: ChartFilter = {
    paramSelected: [],
    selectedItems: [this.schemeService.scheme.dig_type[0]],
    timeFrom: 0,
    timeTo: 0,
    user_charts: [],
    charts_type: Chart_Type.CT_DIG_TYPE,
    user_chart: null,
    data_part_size: 100000
  };

  charts: Chart_Info_Interface[] = [];
  members: Scheme_Group_Member[] = [];

  private logSub: ISubscription;
  private paramSub: ISubscription;
  values_loaded: boolean;
  params_loaded: boolean;
  initialized = false;
  user_charts: Chart[];

  constructor(
    public translate: TranslateService,
    private schemeService: SchemeService,
  ) {
    const today = new Date();
    const todayEnd = new Date();

    today.setHours(0, 0, 0, 0);
    todayEnd.setHours(23, 59, 59, 0);

    this.chartFilter.timeFrom = today.getTime();
    this.chartFilter.timeTo = todayEnd.getTime();
  }

  ngOnInit() {
    this.schemeService.get_charts().subscribe(charts => {
      this.user_charts = charts;

      this.initCharts(this.chartFilter);
    });
  }

  initCharts(chartFilter: ChartFilter): void
  {
    this.chartFilter = chartFilter;

    if (!this.chartFilter.selectedItems.length) {
      console.log('Init charts failed', this.chartFilter.charts_type, this.chartFilter.selectedItems);
      return;
    }

    this.charts = [];

    let data_ptr = { dev_items: [], params: [] };

    switch(this.chartFilter.charts_type)
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

    this.time_from_ = this.chartFilter.timeFrom;
    this.time_to_ = this.chartFilter.timeTo;
    this.is_today = new Date().getTime() < this.time_to_;

    this.logs_count = 0;
    this.logs_count2 = 0;
    this.initialized = false;
    this.values_loaded = false;
    this.params_loaded = false;
    this.getParamData();
    this.getLogs();
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
        const params = this.get_dig_param_ids(this.chartFilter.paramSelected);
        const sections = this.schemeService.scheme.section;
        for (const sct of sections) {
          for (const group of sct.groups) {
            if (group.type_id === this.chartFilter.selectedItems[0].id) {
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
        const params = this.get_dig_param_ids(this.chartFilter.paramSelected);
        const sections = this.schemeService.scheme.section;
        for (const sct of sections) {
          for (const group of sct.groups) {
            const datasets: any[] = [];
            for (const item of group.items) {
              for (const type of this.chartFilter.selectedItems) {
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
        const items = this.chartFilter.selectedItems.map(it => { return {id: it.id, color: null}; });
        const params = this.chartFilter.paramSelected.map(it => { return {id: it.id, color: null}; });
        this.initDeviceItemChartsImpl(data, items, params);
    }

    randomColorFactor(): number {
      return Math.round(Math.random() * 255);
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

        const user_chart = this.chartFilter.selectedItems[0];
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
            // if (this.is_today)
            {
                let item;
                const x = this.is_today ? new Date() : new Date(this.time_to_);
                for (const chart of this.charts)
                {
                    for (const dataset of chart.data.datasets)
                    {
                        let y;
                        if (this.is_today)
                        {
                            const log = dataset.dev_item ? dataset.dev_item.val : dataset.param;
                            y = this.getY(chart, log, dataset.steppedLine);
                        }
                        else if (dataset.realData.length !== 0)
                        {
                            const last = dataset.realData[dataset.realData.length - 1];
                            if (last.x < x)
                                y = last.y;
                        }

                        if (y !== undefined && y !== null)
                        {
                            if (dataset.realData.length === 0)
                            {
                                const x0 = new Date(this.time_from_);
                                item = {x: x0, y};
                                dataset.data.push(item);
                                dataset.realData.push(item);
                            }
                            item = {x, y};
                            dataset.data.push(item);
                            dataset.realData.push(item);
                        }
                    }
                }
            }

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

    getParamData(offset: number = 0): void {
        if (this.param_data_.length) {
            this.paramSub = this.schemeService.getChartParamData(this.time_from_, this.time_to_, this.param_data_, this.chartFilter.data_part_size, offset)
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

        if (logs.count >= this.chartFilter.data_part_size && this.logs_count2 < 10000000)
            this.getParamData(this.logs_count2);
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
                            if (!dataset.usered_data)
                                dataset.usered_data = {};
                            dataset.usered_data[x.getTime()] = log_item.user_id;
                        }
                        dataset.data.push(data);
                        dataset.realData.push(data);
                    }
                }
            }
        }
    }

    getLogs(offset: number = 0): void {
        this.logSub = this.schemeService.getChartData(this.time_from_, this.time_to_, this.data_, this.chartFilter.data_part_size, offset)
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

        if (logs.count >= this.chartFilter.data_part_size && this.logs_count < 10000000)
            this.getLogs(this.logs_count);
        else
            this.set_initialized(true);
    }

  breakLoad(): void {
      if (this.paramSub)
          this.paramSub.unsubscribe();
      if (this.logSub)
          this.logSub.unsubscribe();
      this.set_initialized(true);
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
        realData: [],

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

  randomColor(opacity: number): string {
    return `rgba(${this.randomColorFactor()},${this.randomColorFactor()},${this.randomColorFactor()},${opacity || '.3'})`;
  }

}
