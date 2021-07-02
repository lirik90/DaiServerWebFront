import {Chart, Axis_Params, Device_Item, DIG_Param} from '../../scheme';
import {Hsl} from './color-picker-dialog/color-picker-dialog';
import {ChartDataSets} from 'chart.js';

export enum Chart_Type {
    CT_UNKNOWN,
    CT_USER,
    CT_DIG_TYPE,
    CT_DEVICE_ITEM,
}

export interface Select_Item_Iface {
    id: number;
    title: string;
    category: string;
}

export interface Chart_Info_Interface {
    name: string;
    charts_type: Chart_Type;
    data: {
        datasets: (ChartDataSets & { dev_item?: Device_Item, param?: DIG_Param } & any)[];
    };

    axes?: any[];
}

export interface TimeFilter
{
    timeFrom: number;
    timeTo: number;
}

export interface Legend_Options {
    idx: number;

    color: Hsl;
    displayColor: string;
    stepped: boolean;
    hidden: boolean;

    scale: Omit<Axis_Params, 'id'>;
}

export interface ItemWithLegend<T> {
    isParam: boolean;
    item: T;
    legend: Legend_Options;
    label: string;

    showModal?: boolean; // this param is needed to show/hide axis configuration modal
}

export interface Chart_Params {
    name: string;
    dataset_params: ItemWithLegend<any>[],
}

export interface ChartFilter extends TimeFilter {
    user_chart: Chart;
    user_charts: Chart[];

    selected_charts?: Chart_Params[];

    charts_type: Chart_Type;
    data_part_size: number;

    paramSelected?: any[];
    selectedItems?: any[];
}

export interface ZoomInfo extends TimeFilter {
    isZoom: boolean;
}

export interface BuiltChartParams {
    axes: Axis_Params[];
    datasets: any[];
}

