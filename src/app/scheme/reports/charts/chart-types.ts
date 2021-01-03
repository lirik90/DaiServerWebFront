import {Chart, Device_Item_Type, DIG_Param, DIG_Type} from '../../scheme';
import {Hsl} from './color-picker-dialog/color-picker-dialog';

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
        datasets: any[];
    };

    axes?: any[];
}

export interface TimeFilter
{
    timeFrom: number;
    timeTo: number;
}

export interface Axis_Params {
    id: string;

    isRight: boolean;
    from: number | string;
    to: number | string;
    order: number | string;
}

export interface Legend_Options {
    idx: number;

    color: Hsl;
    displayColor: string;
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

