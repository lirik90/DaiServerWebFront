import {
    Component,
    DoCheck,
    EventEmitter,
    Input, KeyValueChanges,
    KeyValueDiffer,
    KeyValueDiffers,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
    NgZone
} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {KeyValue} from '@angular/common';

import {BaseChartDirective} from 'ng2-charts';

import {Paginator_Chart_Value, SchemeService} from '../../../scheme.service';
import {Scheme_Group_Member} from '../../../../user';
import {Hsl, ColorPickerDialog} from '../color-picker-dialog/color-picker-dialog';
import {Chart_Info_Interface, ZoomInfo} from '../chart-types';

@Component({
    selector: 'app-chart-item',
    templateUrl: './chart-item.component.html',
    styleUrls: ['./chart-item.component.css']
})
export class ChartItemComponent implements OnInit, OnChanges, DoCheck {
    private _chartInfo: Chart_Info_Interface;
    private _differ: KeyValueDiffer<number, any>;
    private _datasetsDiffers: { [key: string]: KeyValueDiffer<any, any> } = {};

    get chartInfo(): Chart_Info_Interface {
        return this._chartInfo;
    }

    @Input() set chartInfo(v: Chart_Info_Interface) {
        this._chartInfo = v;
        if (!this._differ && v.data?.datasets) {
            this._differ = this.differs.find(v.data.datasets).create();
        }
    }

    @ViewChild('chart_obj') chart: BaseChartDirective;
    @Output() rangeChange: EventEmitter<ZoomInfo> = new EventEmitter();

    update(): void
    {
        this.zone.run(() =>
        this.chart.chart.update());
    }

    options = {
        elements: {
            point: {radius: 0},
            line: {
                tension: 0,
                borderWidth: 1
            }
        },
        animation: {duration: 0},
        responsive: true,
        responsiveAnimationDuration: 0,
        legend: {
            // display: false,
            // position: 'bottom',
            // onClick: (e, legendItem) => {
            //     const dataset = (<any>this.chart.data).datasets[legendItem.datasetIndex];
            //     dataset.hidden = !dataset.hidden;
            //     this.chart.chart.update();
            // }
        },
        //  maintainAspectRatio: false,
        tooltips: {
            mode: 'nearest',
            intersect: false,
            callbacks: {label: (item, data) => this.onLabel(item, data)}
        },
        hover: {
            mode: 'nearest',
            intersect: false,
            animationDuration: 0
        },
        scales: {
            xAxes: [{
                offset: true,
                stacked: true,
                type: 'time',
                time: {
                    tooltipFormat: 'DD MMMM YYYY HH:mm:ss',
                    displayFormats: {
                        millisecond: 'HH:mm:ss.SSS',
                        second: 'HH:mm:ss',
                        minute: 'HH:mm',
                        hour: 'HH:mm',
                        day: 'DD MMM',
                    },
                },
                ticks: {
                    major: {
                        enabled: true,
                        fontStyle: 'bold',
                        fontColor: 'rgb(54, 143, 3)'
                    },
                    sampleSize: 10,
                    maxRotation: 30,
                    minRotation: 30
                },
                afterFit: (scale) => {
                    scale.height = 40;
                }
            }],
            yAxes: [{
                id: 'A',
                type: 'linear',
                position: 'left',
            }, {
                id: 'B',
                type: 'linear',
                position: 'right',
                ticks: {
                    max: 2,
                    min: -1,
                    stepSize: 1,
                    suggestedMin: 0,
                    suggestedMax: 1
                }
            }]
        },
        plugins: {
            zoom: {
                pan: {
                    enabled: true,
                    mode: 'x',
                    rangeMax: {x: new Date()}, // TODO: update this sometimes
                    onPanComplete: chart => this.onZoom(chart, false)
                },
                zoom: {
                    enabled: true,
                    mode: 'x',
                    onZoomComplete: chart => this.onZoom(chart, true)
                }
            }
        },
    };

    private members: Scheme_Group_Member[];

    constructor(
        private schemeService: SchemeService,
        private dialog: MatDialog,
        private differs: KeyValueDiffers,
        private zone: NgZone
    ) {
    }

    ngOnInit(): void {
        this.schemeService.getMembers().subscribe(members => this.members = members.results);
    }

    ngOnChanges(changes: SimpleChanges) {
        // console.log('ngOnChanges');
        if (changes.chartInfo && changes.chartInfo.currentValue) {
            const chart = changes.chartInfo.currentValue;
            // setTimeout(() => this.onZoom(this.chart), 500);
        }
    }

    ngDoCheck(): void {
        // console.log('ngDoCheck');
        let apply = false;

        if (this._datasetsDiffers) {
            Object.keys(this._datasetsDiffers).forEach((key) => {
                const differ = this._datasetsDiffers[key];
                const changes = differ.diff(this.chartInfo.data.datasets[key]);

                if (changes) {
                    apply = true;
                }
            });
        }

        if (this._differ) {
            const changes = this._differ.diff(this.chartInfo.data.datasets);
            if (changes) {
                changes.forEachAddedItem((r) => {
                    this._datasetsDiffers[r.key] = this.differs.find(r.currentValue).create();
                    apply = true;
                });
            }
        }

        if (apply) {
            this.applyDatasetChanges();
        } else {
            // console.dir(this._differ);
            // console.dir(this._datasetsDiffers);
        }
    }

    static getY(log: any, is_stepped: boolean): any {
        let y = log.value;
        if (y == undefined || y == null)
            return null;

        // if (log.value == null || /^(\-|\+)?([0-9]+|Infinity)$/.test(log.value))
        if (typeof y !== 'string')
            return y;
        if (/^(\-|\+)?([0-9\.]+|Infinity)$/.test(y))
            return parseFloat(y);

        if (is_stepped)
        {
            // TODO: Remove it
            if (y === 'Норма' || y === 'Открыто')
                return 1;
            else if (y === 'Низкий' || y === 'Закрыто')
                return 0;
            return y.length;
        }

        const v2_type = typeof log.raw_value;
        return (v2_type === 'number' || v2_type === 'boolean') ?
            log.raw_value : y.length;
    }

    addData(dataPack: Paginator_Chart_Value, data_param_name: string): void
    {
        for (const dataset of this.chartInfo.data.datasets)
            if (dataset[data_param_name])
                dataset.data.splice(0, dataset.data.length);
        const findDataset = (data_param_name: string, id: number) => 
        {
            for (const dataset of this.chartInfo.data.datasets)
                if (dataset[data_param_name] && dataset[data_param_name].id == id)
                    return dataset;
            return null;
        };
        
        for (const log of dataPack.results)
        {
            const dataset = findDataset(data_param_name, log.item_id);
            if (!dataset)
                continue;

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

        this.chart.chart.update();
    }

    addDevItemValues(logs: Paginator_Chart_Value): void
    {
        this.addData(logs, 'dev_item');
    }

    addParamValues(params: Paginator_Chart_Value): void
    {
        this.addData(params, 'param');
    }

    random_color(): void {
        for (const dataset of (<any>this.chart.data).datasets)
            this.setDataColor(dataset, {
                h: Math.round(Math.random() * 360),
                s: Math.round(Math.random() * 100),
                l: Math.round(Math.random() * 100) });
        this.chart.chart.update();
    }

    setDataColor(dataset: any, hsl: Hsl): void
    {
        const hslStr = `${hsl.h}, ${hsl.s}%, ${hsl.l}%`;
        console.log(hsl, hslStr);
        dataset.borderColor = `hsl(${hslStr}`;
        dataset.backgroundColor = `hsla(${hslStr},0.5)`;
        dataset.pointBorderColor = `hsla(${hslStr},0.7)`;
        dataset.pointBackgroundColor = `hsla(${hslStr},0.5)`;
    }

    onZoom(chart: any, isZoom: boolean): void {
        const xAxis = chart.chart.scales['x-axis-0'];
        this.rangeChange.emit({timeFrom: Math.floor(xAxis.min), timeTo: Math.floor(xAxis.max), isZoom});
    }

    onLabel(item, data): string {
        // console.log('callback label:', item, data);
        const dataset = data.datasets[item.datasetIndex];
        let text = item.value; //dataset.steppedLine && dataset.dev_item ?
//            (item.yLabel < dataset['my_cond'] ? '0' : '1') :
  //          item.value;

        if (dataset.usered_data) {
            const x = dataset.data[item.index].x.getTime();
            const user_id = dataset.usered_data[x];
            if (dataset.usered_data[x]) {
                for (const user of this.members) {
                    if (user.id === user_id) {
                        text += ' User: ' + user.name;
                        break;
                    }
                }
            }
        }
        return dataset.label + ': ' + text;
    }

    openColorPicker(chart: Chart_Info_Interface, dataset: any, chart_obj: any): void {
        const dialogRef = this.dialog.open(ColorPickerDialog, {
            width: '450px',
            data: {chart, dataset, chart_obj}
        });

        dialogRef.afterClosed().subscribe(hsl => {
            if (hsl !== undefined && hsl !== null)
            {
                this.setDataColor(dataset, hsl);
                this.chart.chart.update();
            }
        });
    }

    private applyDatasetChanges(changes?: KeyValueChanges<string, any>) {
        // console.log('apply dataset changes');
    }
}
