import {Chart} from '../../scheme';

export enum Chart_Type {
    CT_UNKNOWN,
    CT_USER,
    CT_DIG_TYPE,
    CT_DEVICE_ITEM_TYPE,
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

export interface ChartFilter extends TimeFilter {
    user_chart: Chart;
    user_charts: Chart[];

    selectedItems: any[];
    paramSelected: any[];

    charts_type: Chart_Type;
    data_part_size: number;
}

export interface ZoomInfo extends TimeFilter {
    isZoom: boolean;
}

