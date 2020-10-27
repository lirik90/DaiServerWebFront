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
    ViewChild
} from '@angular/core';
import {BaseChartDirective} from 'ng2-charts';
import {SchemeService} from '../../../scheme.service';
import {Scheme_Group_Member} from '../../../../user';
import {ColorPickerDialog} from '../color-picker-dialog/color-picker-dialog';
import {Chart_Info_Interface, ZoomInfo} from '../chart-types';
import {MatDialog} from '@angular/material/dialog';
import {KeyValue} from '@angular/common';

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
        this.chart.chart.update();
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
    ) {
    }

    ngOnInit(): void {
        this.schemeService.getMembers().subscribe(members => this.members = members.results);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.chartInfo && changes.chartInfo.currentValue) {
            const chart = changes.chartInfo.currentValue;
            const { min_y, max_y } = chart;
            // setTimeout(() => this.onZoom(this.chart), 500);
        }
    }

    ngDoCheck(): void {
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
            console.dir(this._differ);
            console.dir(this._datasetsDiffers);
        }
    }

    random_color(): void {
        for (const dataset of (<any>this.chart.data).datasets)
            this.setDataColor(dataset, Math.round(Math.random() * 360));
        this.chart.chart.update();
    }

    setDataColor(dataset: any, hue: number): void
    {
        const hueStr = `${hue}, 95%, 50%`;
        dataset.borderColor = `hsl(${hueStr}`;
        dataset.backgroundColor = `hsla(${hueStr},0.5)`;
        dataset.pointBorderColor = `hsla(${hueStr},0.7)`;
        dataset.pointBackgroundColor = `hsla(${hueStr},0.5)`;
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

        dialogRef.afterClosed().subscribe(hue => {
            if (hue !== undefined && hue !== null)
            {
                this.setDataColor(dataset, hue);
                this.chart.chart.update();
            }
        });
    }

    private applyDatasetChanges(changes?: KeyValueChanges<string, any>) {
        console.log('apply dataset changes');
    }
}
