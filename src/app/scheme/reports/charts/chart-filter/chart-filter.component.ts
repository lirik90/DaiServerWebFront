import {Component, IterableDiffer, IterableDiffers, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import * as moment from 'moment';
import {Chart_Info_Interface, Chart_Params, Chart_Type, ChartFilter, ItemWithLegend, Select_Item_Iface} from '../chart-types';
import {Chart, Chart_Item, Device_Item, Device_Item_Group, DIG_Param, DIG_Param_Value_Type, Save_Algorithm, Section} from '../../../scheme';
import {SchemeService} from '../../../scheme.service';
import {ColorPickerDialog, Hsl} from '../color-picker-dialog/color-picker-dialog';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS, MomentDateAdapter} from '@angular/material-moment-adapter';
import {SidebarAction, SidebarService} from '../../../sidebar.service';
import {Subscription} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {MatDialog} from '@angular/material/dialog';

interface Chart_Item_Iface {
    id: number;
    hsl: Hsl;
}

function parseDate(date: FormControl, time: string): number {
    let time_arr = time.split(':');
    let date_from = date.value.toDate();
    date_from.setHours(+time_arr[0], +time_arr[1], +time_arr[2] || 0);

    return date_from.getTime();
}

function zero(n: number): string {
    return n >= 10 ? `${n}` : `0${n}`;
}

function parseDateToDateAndTime(date: number, fcRef: FormControl): string {
    const d = new Date(date);

    fcRef.setValue(moment(d));

    return `${zero(d.getHours())}:${zero(d.getMinutes())}:${zero(d.getSeconds())}`;
}

@Component({
    selector: 'app-chart-filter',
    templateUrl: './chart-filter.component.html',
    styleUrls: ['./chart-filter.component.css'],
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
    ]
})
export class ChartFilterComponent implements OnInit, OnDestroy {
    chartType = Chart_Type;
    params: ChartFilter;

    chart_filter: ChartFilter;
    charts: Chart_Info_Interface[];

    // ngModels
    charts_type: Chart_Type = Chart_Type.CT_USER;
    date_from = new FormControl(moment());
    time_from = '00:00:00';
    date_to = new FormControl(moment());
    time_to = '23:59:59';
    user_chart: Chart;
    itemList = [];
    selected_charts: Chart_Params[] = [];
    settings: any = {};
    user_charts: Chart[] = [];

    paramList: Select_Item_Iface[] = [];
    paramSettings: any = {};

    private selectedItems_ = [];
    private paramSelected_: Select_Item_Iface[] = [];

    get selectedItems() {
        return this.selectedItems_;
    }

    get paramSelected() {
        return this.paramSelected_;
    }

    set selectedItems(v) {
        this.selectedItems_ = v;
        if (!this.selectedItemsDiffer && v) {
            this.selectedItemsDiffer = this.differs.find(v).create();
        }
    }

    set paramSelected(v) {
        this.paramSelected_ = v;
        if (!this.paramSelectedDiffer && v) {
            this.paramSelectedDiffer = this.differs.find(v).create();
        }
    }

    private selectedItemsDiffer: IterableDiffer<any>;
    private paramSelectedDiffer: IterableDiffer<any>;

    data_part_size = 100000;
    private sidebarActionBroadcast$: Subscription;
    private is_first_update = true;
    private is_user_charts_loaded = false;

    constructor(
        private schemeService: SchemeService,
        private sidebar: SidebarService,
        private dateAdapter: DateAdapter<any>,
        private translate: TranslateService,
        private dialog: MatDialog,
        private differs: IterableDiffers,
    ) {
        this.dateAdapter.setLocale(this.translate.currentLang);
        this.sidebarActionBroadcast$ = this.sidebar.getSidebarActionBroadcast()
            .subscribe((action) => this.sidebarAction(action));
    }

    ngOnInit(): void {
        this.fetchUserCharts();
    }

    ngOnDestroy(): void {
        this.sidebarActionBroadcast$.unsubscribe();
    }

    chartFilterUpdated(chartFilter: ChartFilter) {
        this.charts_type = chartFilter.charts_type;
        this.data_part_size = chartFilter.data_part_size;
        this.user_chart = chartFilter.user_chart;

        this.time_from = parseDateToDateAndTime(chartFilter.timeFrom, this.date_from);
        this.time_to = parseDateToDateAndTime(chartFilter.timeTo, this.date_to);

        if (!this.user_charts.length && !this.charts_type) {
            this.charts_type = Chart_Type.CT_DIG_TYPE;
        }

        if (chartFilter.selectedItems && chartFilter.selectedItems.length > 0) {
            this.OnChartsType();

            this.selectedItems = chartFilter.selectedItems;
            this.paramSelected = chartFilter.paramSelected;

            this.onItemSelect(this.selectedItems[0]);
        }

        if (this.is_first_update && this.is_user_charts_loaded) {
            this.is_first_update = false;
            this.buildChart();
        }
    }

    OnChartsType(user_chart: Chart = undefined): void {
        if (user_chart) {
            this.user_chart = {...user_chart};
        } else {
            this.user_chart = {id: 0, name: ''} as Chart;
        }

        this.selectedItems = [];
        this.settings = {
            text: '',
            selectAllText: this.translate.instant('SELECT_ALL'),
            // unSelectAllText: 'Снять все',
            classes: 'chart-type-data ctd-items',
            enableSearchFilter: true,
            labelKey: 'title',
            singleSelection: false,
            groupBy: '',
            clearAll: false,
        };

        this.paramSelected = [];
        this.paramSettings = {
            text: '',
            selectAllText: this.translate.instant('SELECT_ALL'),
            classes: 'chart-type-data custom-class',
            enableSearchFilter: true,
            labelKey: 'title',
            groupBy: 'category'
        };

        switch (this.charts_type) {
            case Chart_Type.CT_USER:
                this.itemList = this.user_charts;
                if (user_chart) {
                    this.selectedItems.push(user_chart);
                } else {
                    if (this.itemList.length) {
                        this.selectedItems.push(this.itemList[0]);
                    }
                }
                this.settings.text = this.translate.instant('REPORTS.SELECT_CHART');
                this.settings.singleSelection = true;
                this.settings.labelKey = 'name';

                this.paramList = null;

                break;
            case Chart_Type.CT_DIG_TYPE:
                this.itemList = this.schemeService.scheme.dig_type;
                if (this.itemList.length) {
                    this.selectedItems.push(this.itemList[0]);
                    this.onItemSelect(this.selectedItems[0]);
                }
                this.settings.text = this.translate.instant('REPORTS.SELECT_GROUP_TYPE');
                this.settings.singleSelection = true;

                this.paramSettings.text = this.translate.instant('REPORTS.SELECT_PARAM_TYPE');
                break;
            case Chart_Type.CT_DEVICE_ITEM:
                this.itemList = this.getDevItemList();
                this.settings.text = this.translate.instant('REPORTS.SELECT_ITEM');
                this.settings.groupBy = 'category';
                this.settings.clearAll = true;

                this.paramList = this.getParamList();
                this.paramSettings.text = this.translate.instant('REPORTS.SELECT_PARAM');
                break;
            default:
                break;
        }

        this.rebuild();
    }

    onItemSelect(item: any): void {
        if (this.charts_type === Chart_Type.CT_DIG_TYPE) {
            const accepted_param_type_ids = this.schemeService.scheme.dig_param_type
                .filter(param_type => param_type.group_type_id === item.id)
                .map(param_type => param_type.id);

            this.paramSelected = [];
            this.paramList = this.getParamTypeList().filter((param_type: Select_Item_Iface) => {
                return accepted_param_type_ids.includes(param_type.id);
            });
        }

        this.rebuild();

        if (this.charts_type === Chart_Type.CT_USER) {
            this.selectUserChart(item);
        }
    }

    rebuild() {
        if (!this.selectedItemsDiffer.diff(this.selectedItems) && !this.paramSelectedDiffer.diff(this.paramSelected)) {
            return;
        }

        this.selected_charts = [];
        switch (this.charts_type) {
            case Chart_Type.CT_USER:
                this.initDeviceUserDatasets();
                break;
            case Chart_Type.CT_DIG_TYPE:
                this.initDigTypeDatasets();
                break;
            case Chart_Type.CT_DEVICE_ITEM:
                this.initDeviceItemDatasets();
                break;
        }
    }

    private static pushToDatasetParams(dataset_params_ref: ItemWithLegend<Device_Item | DIG_Param>[], item: Device_Item | DIG_Param, isParam: boolean = false) {
        const idx = dataset_params_ref.length;
        let title;
        if (item instanceof Device_Item) {
            title = item.type?.title;
        } else {
            title =  item.param?.title;
        }

        const color = ChartFilterComponent.getColorByIndex(idx, title);
        const displayColor = `hsl(${color.h}, ${color.s}%, ${color.l}%)`;

        dataset_params_ref.push({
            label: title,
            item,
            isParam,
            legend: {
                hidden: false,
                scale: {
                    from: null,
                    to: null,
                    isRight: null,
                    order: idx,
                },
                displayColor,
                color,
                idx,
            }
        });
    }

    initDeviceItemDatasetsImpl(dev_items: Chart_Item_Iface[], params: Chart_Item_Iface[]): void {
        const dataset_params: ItemWithLegend<any>[] = [];
        const sections = this.schemeService.scheme.section;
        for (const sct of sections) {
            for (const group of sct.groups) {
                for (const item of group.items) {
                    for (const s_item of dev_items) {
                        if (s_item.id == item.id) {
                            ChartFilterComponent.pushToDatasetParams(dataset_params, item);
                            break;
                        }
                    }
                }

                this.addParam2Dataset(dataset_params, group.params, params);
            }
        }

        this.selected_charts.push({
            name: this.translate.instant('REPORTS.CHARTS_ELEMENTS'),
            dataset_params,
        })
    }

    initDeviceUserDatasets(): void {
        const user_chart = this.selectedItems[0];
        if (!user_chart) return;

        let items = [];
        let params = [];
        for (const it of user_chart.items)
        {
            if (it.item_id)
                items.push({id: it.item_id, hsl: ColorPickerDialog.rgbhex2hsl(it.color)});
            else
                params.push({id: it.param_id, hsl: ColorPickerDialog.rgbhex2hsl(it.color)});
        }

        this.initDeviceItemDatasetsImpl(items, params);
        this.copyParamsFromUserChart(user_chart);
    }

    initDeviceItemDatasets(): void {
        const items = this.selectedItems.map(it => { return {id: it.id, hsl: null}; });
        const params = this.paramSelected.map(it => { return {id: it.id, hsl: null}; });
        this.initDeviceItemDatasetsImpl(items, params);
    }

    initDigTypeDatasets(): void {
        const params = this.get_dig_param_ids(this.paramSelected);
        const sections = this.schemeService.scheme.section;
        for (const sct of sections) {
            for (const group of sct.groups) {
                if (group.type_id === this.selectedItems[0].id) {
                    const dataset_params: ItemWithLegend<Device_Item>[] = [];

                    for (const item of group.items) {
                        if (item.type.save_algorithm > Save_Algorithm.SA_OFF) {
                            ChartFilterComponent.pushToDatasetParams(dataset_params, item);
                        }
                    }

                    this.addParam2Dataset(dataset_params, group.params, params);
                    this.selected_charts.push({
                        name: sct.name,
                        dataset_params,
                    });
                    break;
                }
            }
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

    addParam2Dataset(datasets: ItemWithLegend<any>[], params: DIG_Param[], selected: Chart_Item_Iface[]): void {
        for (const param of params) {
            for (const s_pt of selected) {
                if (s_pt.id === param.id) {
                    ChartFilterComponent.pushToDatasetParams(datasets, param, true);
                    break;
                }
            }

            if (param.childs)
                this.addParam2Dataset(datasets, param.childs, selected);
        }
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

    getParamList(): Select_Item_Iface[] {
        let paramList: Select_Item_Iface[] = [];

        let add_param = (p: DIG_Param, category: string = '') => {
            if (p.childs && p.childs.length) {
                const new_category = category + ' - ' + p.param.title;
                for (const p1 of p.childs) {
                    add_param(p1, new_category);
                }
            } else {
                paramList.push({id: p.id, title: p.param.title, category});
            }
        };

        for (const sct of this.schemeService.scheme.section) {
            for (const group of sct.groups) {
                const po = this.getPrefixObj(sct, group);

                for (const prm of group.params) {
                    add_param(prm, po.category + po.prefix);
                }
            }
        }

        return paramList;
    }

    getParamTypeList(): Select_Item_Iface[] {
        const paramList: Select_Item_Iface[] = [];
        const param_types = this.schemeService.scheme.dig_param_type;
        for (const pt of param_types) {
            if (pt.value_type >= DIG_Param_Value_Type.VT_RANGE
                || pt.value_type <= DIG_Param_Value_Type.VT_UNKNOWN) {
                continue;
            }

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

    edit_user_chart(): void {
        const user_chart = this.selectedItems[0];

        this.charts_type = Chart_Type.CT_DEVICE_ITEM;
        this.OnChartsType(user_chart);

        this.selectedItems = this.itemList.filter(item => {
            for (const it of user_chart.items) {
                if (item.id === it.item_id) {
                    return true;
                }
            }
            return false;
        });

        this.paramSelected = this.paramList.filter(item => {
            for (const it of user_chart.items) {
                if (item.id === it.param_id) {
                    return true;
                }
            }
            return false;
        });

        this.rebuild();
        this.copyParamsFromUserChart(user_chart);
    }

    save_user_chart(): void {
        if (!this.user_chart.name.length) {
            return;
        }

        if (!this.selectedItems.length && !this.paramSelected.length) {
            return;
        }

        let user_chart = new Chart;
        user_chart.id = this.user_chart.id;
        user_chart.name = this.user_chart.name;
        user_chart.items = [];

        for (const item of this.selected_charts[0].dataset_params) {
            let item_id = null;
            let param_id = null;
            let extra: Chart_Item['extra'] = null;

            if (item.isParam) {
                param_id = item.item.id;
            } else {
                item_id = item.item.id;
            }

            if (item.legend) {
                const { scale, color } = item.legend;
                extra = {
                    color: ColorPickerDialog.hsl2RgbStr(color),
                    axis_params: scale,
                } as Chart_Item['extra'];
            }

            const chart_item: Chart_Item = {
                extra,
                item_id,
                param_id,
            };
            user_chart.items.push(chart_item);
        }

        this.schemeService.save_chart(user_chart).subscribe(new_chart => {
            let found = false;
            for (let chart of this.user_charts) {
                if (chart.id === new_chart.id) {
                    chart.name = new_chart.name;
                    chart.items = new_chart.items;
                    found = true;
                    break;
                }
            }

            if (!found) {
                this.user_charts.push(new_chart);
            }

            const idx = this.user_charts.findIndex(chart => chart.id === new_chart.id);
            this.selectUserChart(this.user_charts[idx]);
        });
    }

    del_user_chart(): void {
        const user_chart = this.selectedItems[0];

        this.schemeService.del_chart(user_chart).subscribe(is_removed => {
            if (!is_removed) {
                return;
            }

            for (const chart_i in this.user_charts) {
                if (this.user_charts[chart_i].id === user_chart.id) {
                    this.user_charts.splice(parseInt(chart_i), 1);
                    break;
                }
            }

            this.selectedItems = [];
            if (this.user_charts.length) {
                this.selectUserChart(this.user_charts[0]);
            }
        });
    }

    buildChart() {
        this.sidebar.performActionToContent({
            type: 'params_change',
            data: {
                timeFrom: parseDate(this.date_from, this.time_from),
                timeTo: parseDate(this.date_to, this.time_to),
                selected_charts: this.selected_charts,
                user_chart: this.user_chart,
                user_charts: this.user_charts,
                charts_type: this.charts_type,
                data_part_size: this.data_part_size,
            },
        });
    }

    private sidebarAction(action: SidebarAction<any>) {
        if (action.type === 'chart_filter') {
            this.chartFilterUpdated(action.data);
        }

        if (action.type === 'charts') {
            this.charts = action.data.charts;

            if (!this.chart_filter) {
                this.chartFilterUpdated(action.data.chart_filter);
            }
        }

        if (action.type === 'chart_axes') {
            this.selected_charts[0].dataset_params.forEach((dsp) => {
                const axe = action.data.axes.find(axe => axe.id === dsp.item.id && axe.isParam === dsp.isParam);

                dsp.legend.scale.from = axe.from;
                dsp.legend.scale.to = axe.to;
                dsp.legend.scale.isRight = axe.isRight;
            });
        }
    }

    openColorPicker(chart_params: Chart_Params, dataset: ItemWithLegend<any>): void {
        const dialogRef = this.dialog.open(ColorPickerDialog, {
            width: '450px',
            data: {dataset, chart_params}
        });

        dialogRef.afterClosed().subscribe(hsl => {
            if (hsl !== undefined && hsl !== null)
            {
                dataset.legend.color = hsl;
                this.dataset_legend_updated(dataset);
            }
        });
    }

    toggleDatasetVisibility(dataset: ItemWithLegend<any>): void {
        dataset.legend.hidden = !dataset.legend.hidden;
        this.dataset_legend_updated(dataset);
    }

    private static getColorByIndex(index: number, label: string): Hsl
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
                return { h: this.hashCode(label), s: 95, l: 35 } as Hsl;
        }
    }

    private static hashCode(str: string): number { // java String#hashCode
        let hash = 0;
        for (let i = 0; i < str.length; i++)
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        return hash;
    }

    private dataset_legend_updated(dataset: ItemWithLegend<any>) {
        const hsl = dataset.legend.color;
        dataset.legend.displayColor = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

        this.sidebar.performActionToContent({
            type: 'legend_updated',
            data: dataset,
        });
    }

    toggleLegendModal(ds: ItemWithLegend<any>) {
        ds.showModal = !ds.showModal;

        if (ds.showModal) {
            return;
        }

        // Process inputted values if modal closed
        const { scale } = ds.legend;
        if (scale) {
            if (scale.from && typeof scale.from === 'string') {
                scale.from = parseFloat(scale.from);
            }

            if (scale.to && typeof scale.to === 'string') {
                scale.to = parseFloat(scale.to);
            }

            if (scale.order && typeof scale.order === 'string') {
                scale.order = parseInt(scale.order, 10);
            }
        }
    }

    private copyParamsFromUserChart(user_chart: Chart) {
        user_chart.items.forEach((axeItem: Chart_Item) => {
            const datasetItem = this.selected_charts[0].dataset_params
                .find(dsItem => dsItem.isParam ? axeItem.param_id === dsItem.item.id : axeItem.item_id === dsItem.item.id);

            const hsl = ColorPickerDialog.rgbhex2hsl(axeItem.extra.color);
            const { h, s, l } = hsl;
            const legendPatch = {
                scale: axeItem.extra.axis_params,
                color: hsl,
                displayColor: `hsl(${h}, ${s}%, ${l}%)`,
                hidden: false,
            };

            Object.assign(datasetItem.legend, legendPatch);
        });
    }

    private fetchUserCharts() {
        this.schemeService.get_charts().subscribe(charts => {
            this.user_charts = charts;
            this.is_user_charts_loaded = true;

            if (this.is_first_update) {
                this.is_first_update = false;

                if (this.user_charts.length > 0) {
                    this.selectUserChart(this.user_charts[0]);
                } else {
                    this.buildChart();
                }
            }
        });
    }

    private selectUserChart(chart: Chart) {
        this.charts_type = Chart_Type.CT_USER;

        this.selectedItems = [];
        this.paramSelected = [];

        this.OnChartsType(chart);
        this.buildChart();
    }
}
