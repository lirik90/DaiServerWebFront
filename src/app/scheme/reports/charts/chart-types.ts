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
        datasets: any[]
    };
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
    hidden: boolean;

    scale: {
        from: number;
        to: number;
        // TODO: more params
    };
}

export interface ItemWithLegend<T> { // TODO:  extends { title: string } ??
    isParam: boolean; // TODO: may be remove
    item: T;
    legend: Legend_Options;
    label: string;
}

export interface Chart_Params {
    name: string;
    dataset_params: ItemWithLegend<any>[],
}

export interface ChartFilter<T> extends TimeFilter {
    user_chart: Chart;
    user_charts: Chart[];

    selected_charts?: Chart_Params[];

    charts_type: Chart_Type;
    data_part_size: number;

    paramSelected?: any[];
    selectedItems?: any[];
}

export interface GroupChartFilter extends ChartFilter<DIG_Type> {
    charts_type: Chart_Type.CT_DIG_TYPE;
}

export interface DeviceItemChartFilter extends ChartFilter<Select_Item_Iface> {
    charts_type: Chart_Type.CT_DEVICE_ITEM;
}

// @ts-ignore TODO: remove
export interface UserChartFilter extends ChartFilter<Chart> {
    charts_type: Chart_Type.CT_USER;
}

export interface ZoomInfo extends TimeFilter {
    isZoom: boolean;
}

