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
    data: {
        datasets: any[]
    };

    min_y: number;
    max_y: number;
}

export interface ChartFilter {
    timeFrom: number;
    timeTo: number;

    user_chart: Chart;
    user_charts: Chart[];

    selectedItems: any[];
    paramSelected: any[];

    charts_type: Chart_Type;
    data_part_size: number;
}
