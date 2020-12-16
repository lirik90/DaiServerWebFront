import {OnInit, OnDestroy, Component, ViewChildren, QueryList, NgZone, ChangeDetectorRef} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

import {delay, exhaustMap, map, mapTo} from 'rxjs/operators';
import {SubscriptionLike, of, timer, combineLatest} from 'rxjs';

// import {ChartComponent} from 'angular2-chartjs';
import 'chartjs-plugin-zoom-plus2';

// import * as moment from 'moment';
 import * as _moment from 'moment';
 import {default as _rollupMoment} from 'moment';
 const moment = _rollupMoment || _moment;
import {Paginator_Chart_Value, Chart_Value_Item, SchemeService} from '../../scheme.service';
import {Chart, Device_Item, DIG_Param, Register_Type, Save_Algorithm} from '../../scheme';
import {Scheme_Group_Member} from '../../../user';
import {Chart_Info_Interface, Chart_Type, ChartFilter, ZoomInfo} from './chart-types';
import {ChartItemComponent} from './chart-item/chart-item.component';
import {Hsl, ColorPickerDialog} from './color-picker-dialog/color-picker-dialog';

interface Chart_Item_Iface
{
    id: number;
    hsl: Hsl;
}

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css'],
  providers: [],
})
export class ChartsComponent implements OnInit, OnDestroy {
//  date_from = new FormControl(new Date().toISOString().slice(0, -1));

    @ViewChildren(ChartItemComponent) chartItems: QueryList<ChartItemComponent>;

  logs_count: number;
  logs_count2: number;

  data_: string;
  param_data_: string;
  time_from_: number;
  time_to_: number;

  // Time_from and time_to with additional 10%
  time_from_ext_: number;
  time_to_ext_: number;

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

  private logSub: SubscriptionLike;
  private paramSub: SubscriptionLike;
  values_loaded: boolean;
  params_loaded: boolean;
  initialized = false;
  user_charts: Chart[];

  constructor(
      public translate: TranslateService,
      private schemeService: SchemeService,
      private changeDetectorRef: ChangeDetectorRef,
      private zone: NgZone
  ) {
      moment.locale('ru');

    const today = new Date();
    const todayEnd = new Date();

    today.setHours(today.getHours() - 6, 0, 0, 0);
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

    ngOnDestroy()
    {
        this.breakLoad(false);
    }

  initCharts(chartFilter: ChartFilter): void
  {
    this.chartFilter = chartFilter;

    if (!this.chartFilter.selectedItems.length) {
      console.warn('Init charts failed', this.chartFilter.charts_type, this.chartFilter.selectedItems);
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

    this.recalculate_time_ext_();

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
          datasets.push(this.genParamDataset(param, datasets.length, s_pt.hsl));
          break;
        }
      }

      if (param.childs)
        this.addParam2Dataset(datasets, data, param.childs, selected);
    }
  }

    get_dig_param_ids(param_types: any[]): Chart_Item_Iface[]
    {
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

            for (const sct of this.schemeService.scheme.section)
            {
                for (const group of sct.groups)
                {
                    const param_id = find_param(group.params, param_type_id);
                    if (param_id)
                        return param_id;
                }
            }
            console.warn('Search param type id: ' + param_type_id + ' failed', this.schemeService.scheme.section);
            return null;
        };

        let res = [];
        for (const param_type of param_types)
        {
            const dig_param_id = get_param_id(param_type.id);
            if (dig_param_id)
                res.push({id: dig_param_id, hsl: null });
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
                  datasets.push(this.genDevItemDataset(item, datasets.length));
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
                  datasets.push(this.genDevItemDataset(item, datasets.length));
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
              datasets.push(this.genDevItemDataset(item, datasets.length, s_item.hsl));
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
        const items = this.chartFilter.selectedItems.map(it => { return {id: it.id, hsl: null}; });
        const params = this.chartFilter.paramSelected.map(it => { return {id: it.id, hsl: null}; });
        this.initDeviceItemChartsImpl(data, items, params);
    }

    initDeviceItemUserCharts(data: any): void
    {
        const user_chart = this.chartFilter.selectedItems[0];
        let items = [];
        let params = [];
        for (const it of user_chart.items)
        {
            if (it.item_id)
                items.push({id: it.item_id, hsl: ColorPickerDialog.rgbhex2hsl(it.color)});
            else
                params.push({id: it.param_id, hsl: ColorPickerDialog.rgbhex2hsl(it.color)});
        }

        //const ids = [...new Set(user_chart.items.map(it => it.item_id))];
        this.initDeviceItemChartsImpl(data, items, params);
    }

    addChart(name: string, datasets: any[]): void {
        if (datasets.length)
            datasets[0].hidden = false;
        this.charts.push({ name, data: {datasets} });
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
                            y = ChartItemComponent.getY(log, dataset.steppedLine);
                        }
                        else if (dataset.data.length !== 0)
                        {
                            const last = dataset.data[dataset.data.length - 1];
                            if (last.x < x)
                                y = last.y;
                        }

                        if (y !== undefined && y !== null)
                        {
                            if (dataset.data.length === 0)
                            {
                                const x0 = new Date(this.time_from_);
                                item = {x: x0, y};
                                dataset.data.push(item);
                            }
                            item = {x, y};
                            dataset.data.push(item);
                        }
                    }
                }
            }

            this.initialized = true;
        }
    }

    getParamData(offset: number = 0, param_data = this.param_data_, first_and_last = false): void {
        if (param_data.length) {
            this.paramSub = this.schemeService.getChartParamData(this.time_from_ext_, this.time_to_ext_, param_data, this.chartFilter.data_part_size, offset, first_and_last)
                .subscribe(
                    (logs: Paginator_Chart_Value) => first_and_last
                            ? this.add_additional_chart_data(logs, 'param', param_data) : this.fillParamData(logs),
                );
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

        this.update_charts_();

        if (logs.count >= this.chartFilter.data_part_size && this.logs_count2 < 10000000)
            this.getParamData(this.logs_count2);
        else
            this.set_initialized(false);

        const nodeIds = this.need_bounds(logs.results, this.param_data_);
        if (nodeIds.length) {
            this.getParamData(0, nodeIds.join(','), true);
        }
    }

    find_dataset(data_param_name: string, data_id): [Chart_Info_Interface, any]
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
            const [, dataset] = this.find_dataset(data_param_name, log.item_id);
            if (dataset)
            {
                for (const log_item of log.data)
                {
                    const y = ChartItemComponent.getY(log_item, dataset.steppedLine);
                    if (y === undefined)
                        continue;

                    const x = new Date(log_item.time);
                    let data = {x, y};
                    if (log_item.user_id)
                    {
                        if (!dataset.usered_data)
                            dataset.usered_data = {};
                        dataset.usered_data[x.getTime()] = log_item.user_id;
                    }
                    dataset.data.push(data);
                }
            }
        }
    }

    getLogs(offset: number = 0, data: string = this.data_, first_and_last = false): void {
        this.logSub = this.schemeService.getChartData(this.time_from_ext_, this.time_to_ext_, data, this.chartFilter.data_part_size, offset, 'value', first_and_last)
            .subscribe((logs: Paginator_Chart_Value) => first_and_last
                    ? this.add_additional_chart_data(logs, 'dev_item', data) : this.fillData(logs),
                );
    }

    fillData(logs: Paginator_Chart_Value): void {
        if (!logs)
        {
            this.set_initialized(true);
            return;
        }

        this.add_chart_data(logs, 'dev_item');
        this.logs_count += logs.count;

        this.update_charts_();

        if (logs.count >= this.chartFilter.data_part_size && this.logs_count < 10000000)
            this.getLogs(this.logs_count);
        else
            this.set_initialized(true);

        const nodeIds = this.need_bounds(logs.results, this.data_);
        if (nodeIds.length) {
            this.getLogs(0, nodeIds.join(','), true);
        }
    }

  breakLoad(is_initialized: boolean = true): void {
      if (this.logSub && !this.logSub.closed)
          this.logSub.unsubscribe();
      if (this.paramSub && !this.paramSub.closed)
          this.paramSub.unsubscribe();
      if (is_initialized)
          this.set_initialized(true);
  }

  genDateString(date: Date, time: string): string {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    let date_str: string = date.getFullYear().toString();
    date_str += `-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day} `;
    return date_str + time;
  }

  genDevItemDataset(item: Device_Item, colorIndex: number, hsl: Hsl = null): Object {
    const label = item.name.length ? item.name : item.type.title;

    const RT = Register_Type;
    const rt = item.type.register_type;
    const stepped = rt === RT.RT_COILS || rt === RT.RT_DISCRETE_INPUTS;

    let dataset = this.genDataset(label, colorIndex, stepped, hsl);
    dataset['dev_item'] = item;
    return dataset;
  }

  genParamDataset(param: DIG_Param, colorIndex: number, hsl: Hsl = null): Object {
    let dataset = this.genDataset('⚙️ ' + param.param.title, colorIndex, true, hsl);
    dataset['param'] = param;
    return dataset;
  }

  genDataset(label: string, colorIndex: number, steppedLine: boolean = true, hsl: Hsl = null): Object {
      if (hsl === null)
          hsl = this.getColorByIndex(colorIndex, label);
      if (hsl.h > 360)
          hsl.h %= 360;
      const hslStr = `${hsl.h}, ${hsl.s}%, ${hsl.l}%`;
    return {
      label,
      data: [],
      yAxisID: steppedLine ? 'B' : 'A',

      borderColor: `hsl(${hslStr})`,
      backgroundColor: `hsl(${hslStr},0.5)`,
      pointBorderColor: `hsl(${hslStr},0.9)`,
      pointBackgroundColor: `hsl(${hslStr},0.5)`,
      pointBorderWidth: 1,

      hidden: false,
      fill: false, //steppedLine,
      steppedLine,
      cubicInterpolationMode: 'monotone',
      //      lineTension: 0,
    };
  }

    getColorByIndex(index: number, label: string): Hsl
    {
        switch (index)
        {
            case 0: return { h: 0, s: 100, l: 35 }; // red
            case 1: return { h: 120, s: 100, l: 35 }; // green
            case 2: return { h: 240, s: 100, l: 35 }; // blue
            case 3: return { h: 60, s: 100, l: 35 }; // yellow
            case 4: return { h: 180, s: 100, l: 35 }; // cyan
            case 5: return { h: 300, s: 100, l: 35 }; // magenta
            case 6: return { h: 30, s: 100, l: 35 }; // brown
            case 7: return { h: 90, s: 100, l: 35 }; // green
            case 8: return { h: 150, s: 100, l: 35 }; //
            case 9: return { h: 210, s: 100, l: 35 }; //
            case 10: return { h: 270, s: 100, l: 35 }; //
            case 11: return { h: 330, s: 100, l: 35 }; //
            default:
                return { h:this.hashCode(label), s: 95, l: 35 } as Hsl;
        }
    }

  hashCode(str: string): number { // java String#hashCode
    var hash = 0;
    for (var i = 0; i < str.length; i++)
       hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return hash;
  }

    chartZoom(chart: Chart_Info_Interface, range: ZoomInfo)
    {
        const findChartItem = (chartInfo: Chart_Info_Interface) =>
        {
            for (const chartItem of this.chartItems)
                if (chartItem.chartInfo === chartInfo)
                    return chartItem;
            return null;
        };

        const chartItem = findChartItem(chart);

        this.breakLoad(false);

        const devItemIds = [];
        const paramIds = [];

        this.logSub = timer(200)
            .pipe(
                exhaustMap(() =>
                {
                    for (const dataset of chart.data.datasets)
                    {
                        if (dataset.dev_item)
                            devItemIds.push(dataset.dev_item.id);
                        else if (dataset.param)
                            paramIds.push(dataset.param.id);
                    }

                    this.time_from_ = range.timeFrom;
                    this.time_to_ = range.timeTo;
                    this.recalculate_time_ext_();

                    chartItem.startLoading();

                    const logs = devItemIds.length ?
                        this.schemeService.getChartData(this.time_from_ext_, this.time_to_ext_, devItemIds.join(','), this.chartFilter.data_part_size, 0) :
                        of(null);

                    const params = paramIds.length ?
                        this.schemeService.getChartParamData(this.time_from_ext_, this.time_to_ext_, paramIds.join(','), this.chartFilter.data_part_size, 0) :
                        of(null);

                    return combineLatest(logs, params);
                }),
            )
            .subscribe(([logs, params]) =>
            {
                if (chartItem)
                {
                    let isAnyBoundsRequests = false;
                    if (logs) {
                        const nodeIds = this.need_bounds(logs.results, devItemIds);
                        if (nodeIds.length) {
                            this.getLogs(0, nodeIds.join(','), true);
                            isAnyBoundsRequests = true;
                        }

                        chartItem.addDevItemValues(logs);
                    }
                    if (params) {
                        const nodeIds = this.need_bounds(params.results, paramIds);
                        if (nodeIds.length) {
                            this.getParamData(0, nodeIds.join(','), true);
                            isAnyBoundsRequests = true;
                        }

                        chartItem.addParamValues(params);
                    }

                    if (!isAnyBoundsRequests) {
                        chartItem.finishedLoading();
                    }
                }
            }, (error) => {
                chartItem.errorLoading(error);
            });
    }

    private find_chart_item_(chart: Chart_Info_Interface): ChartItemComponent {
        return this.chartItems.find(chartItem => chartItem.chartInfo === chart);
    }

    private update_charts_() {
        this.chartItems.forEach((chart_item) => {
            chart_item.update();
        });
    }

    private add_additional_chart_data(logs: Paginator_Chart_Value, data_param_name: string, requested_data: string) {
        const chartsToUpdate = [];

        for (const item_id of requested_data.split(',').map(i => parseInt(i, 10))) {
            const [chart, dataset] = this.find_dataset(data_param_name, item_id);
            if (!dataset || !dataset.data.length) {
                continue;
            }

            chartsToUpdate.push(chart);

            const log = logs.results.find(log => log.item_id === item_id);

            let haveDataBefore = false;
            let haveDataAfter = false;

            log.data = log.data.filter(item => item.value !== null);

            log.data.forEach((item) => {
                haveDataBefore = item.time < dataset.data[0].x.getTime();
                haveDataAfter = item.time > dataset.data[dataset.data.length - 1].x.getTime();
            });

            if (!haveDataBefore) {
                const value = dataset.data[0].y;
                if (value !== null)
                    log.data.splice(0, 0, { value, time: this.time_from_ext_ });
            }

            if (!haveDataAfter) {
                let value = dataset.dev_item ? dataset.dev_item.val?.value : dataset.param.value;
                if (value !== null)
                    log.data.push({ value, time: this.time_to_ext_ });
            }
        }

        chartsToUpdate.forEach((chart) => {
            const chartItem = this.find_chart_item_(chart);

            chartItem.addData(logs, data_param_name, true);
            chartItem.setViewportBounds(this.time_from_, this.time_to_, true);
        });

        this.chartItems.forEach(chartItem => chartItem.finishedLoading());
    }

    private need_bounds(logs: Chart_Value_Item[], requested_data: string | number[]): number[] {
        const ids = typeof requested_data !== 'string' ? requested_data
            : requested_data.split(',').map(id => parseInt(id, 10));
        return ids.filter(id => {
            const log = logs.find(log => log.item_id === id);
            return !log || !log.data.length
                   || log.data[0].time >= this.time_from_
                   || log.data[log.data.length - 1].time <= this.time_to_;
        });
    }

    private recalculate_time_ext_() {
        const additional_range = (this.time_to_ - this.time_from_) * .1;

        this.time_from_ext_ = Math.round(this.time_from_ - additional_range);
        this.time_to_ext_ = Math.round(this.time_to_ + additional_range);
    }
}
