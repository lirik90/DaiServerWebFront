import {
    ChangeDetectorRef,
    Component,
    DoCheck,
    EventEmitter,
    Input,
    KeyValueChanges,
    KeyValueDiffer,
    KeyValueDiffers,
    NgZone,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild
} from '@angular/core';

import {ProgressBarMode} from '@angular/material/progress-bar/progress-bar';
import {ThemePalette} from '@angular/material/core/common-behaviors/color';
import {MatSnackBar} from '@angular/material/snack-bar';
import {BaseChartDirective} from 'ng2-charts';

import {Paginator_Chart_Value, SchemeService} from '../../../scheme.service';
import {Scheme_Group_Member} from '../../../../user';
import {Hsl} from '../color-picker-dialog/color-picker-dialog';
import {BuiltChartParams, Chart_Info_Interface, Chart_Type, ZoomInfo} from '../chart-types';

@Component({
    selector: 'app-chart-item',
    templateUrl: './chart-item.component.html',
    styleUrls: ['./chart-item.component.css']
})
export class ChartItemComponent implements OnInit, OnChanges, DoCheck {
    private readonly defaultYAxes_: any = [{
        id: 'A',
        type: 'linear',
        position: 'left',
        display: 'auto',
    }, {
        id: 'B',
        type: 'linear',
        position: 'right',
        display: 'auto',
        ticks: {
            max: 2,
            min: -1,
            stepSize: 1,
            suggestedMin: 0,
            suggestedMax: 1
        }
    }];

    private _chartInfo: Chart_Info_Interface;
    private _differ: KeyValueDiffer<number, any>;
    private _datasetsDiffers: { [key: string]: KeyValueDiffer<any, any> } = {};

    private readonly leftYAxisLsKey: string = 'scale-a-params';
    private readonly rightYAxisLsKey: string = 'scale-b-params';

    loading: boolean;
    showProgressBar: boolean;
    progressBarMode: ProgressBarMode;
    progressBarColor: ThemePalette;
    progressBarValue: number;

    get chartInfo(): Chart_Info_Interface {
        return this._chartInfo;
    }

    @Input() set chartInfo(v: Chart_Info_Interface) {
        this._chartInfo = v;
        if (!this._differ && v.data?.datasets) {
            this._differ = this.differs.find(v.data.datasets).create();
        }
    }

    @Input() viewportMin: number;
    @Input() viewportMax: number;

    @Input() yAxes: any[];

    @ViewChild('chart_obj') chart: BaseChartDirective;
    @Output() rangeChange: EventEmitter<ZoomInfo> = new EventEmitter();
    @Output() axeChange: EventEmitter<BuiltChartParams> = new EventEmitter();
    @Output() built: EventEmitter<BuiltChartParams> = new EventEmitter();

    update(): void {
        if (!this.chart || !this.chart.chart) return;

        this.zone.run(() => this.chart.chart.update());

        this.built.emit({
            axes: (<any>this.chart.chart).boxes.filter(box => box.id && box.id.length === 1),
            datasets: (<any>this.chart.data).datasets,
        });
    }

    options = {
        elements: {
            point: { radius: 0 },
            line: { tension: 0, borderWidth: 1 }
        },
        animation: { duration: 0 },
        responsive: true,
        maintainAspectRatio: false,
        responsiveAnimationDuration: 0,
        legend: { display: false },
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
                    minRotation: 30,
                    min: undefined, max: undefined
                },
                afterFit: (scale) => {
                    scale.height = 40;
                }
            }],
            yAxes: this.defaultYAxes_,
        },
        plugins: {
            zoom: {
                pan: {
                    enabled: true,
                    mode: 'xy',
                    overScaleMode: 'y',
                    rangeMax: {x: new Date()}, // TODO: update this sometimes
                    onPanComplete: chart => this.onZoom(chart, false)
                },
                zoom: {
                    enabled: true,
                    mode: 'xy',
                    overScaleMode: 'y',
                    onZoomComplete: chart => this.onZoom(chart, true)
                }
            }
        },
    };

    @Input() members: Scheme_Group_Member[];

    constructor(
        private schemeService: SchemeService,
        private differs: KeyValueDiffers,
        private zone: NgZone,
        private snackBar: MatSnackBar,
        private changeDetectorRef: ChangeDetectorRef,
    ) {
    }

    ngOnInit(): void {
        if (this.chartInfo.charts_type === Chart_Type.CT_DIG_TYPE) {
            this.setupYAxisScale(this.leftYAxisLsKey, 0);
            this.setupYAxisScale(this.rightYAxisLsKey, 1);
        } else {
            this.options.scales.yAxes = this.yAxes;
            if (!this.options.scales.yAxes?.length) {
                this.options.scales.yAxes = this.defaultYAxes_;
            }
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.viewportMin || changes.viewportMax) {
            if (changes.viewportMin.currentValue)
                this.options.scales.xAxes[0].ticks.min = changes.viewportMin.currentValue;

            if (changes.viewportMax.currentValue)
                this.options.scales.xAxes[0].ticks.max = changes.viewportMax.currentValue;
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
        }

        console.log('Value dropped', log);
        return null;
    }

    toggleAxisVisibility(axisId: string, v: boolean) {
        const axe = this.options.scales.yAxes.find(axe => axe.id === axisId);
        console.log(axisId, v, axe);
        axe.display = v;
    }

    addData(dataPack: Paginator_Chart_Value, data_param_name: string, additional = false): void
    {
        if (!additional) {
            for (const dataset of this.chartInfo.data.datasets) {
                if (dataset[data_param_name]) {
                    dataset.data.splice(0, dataset.data.length);
                }
            }
        }

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
                if (additional) {
                    const idx = dataset.data.findIndex(v => v.x > x);
                    if (idx < 0 || idx >= dataset.data.length) {
                        dataset.data.push(data);
                    } else {
                        dataset.data.splice(idx, 0, data);
                    }
                } else {
                    dataset.data.push(data);
                }
            }
        }

        this.update();
    }

    addDevItemValues(logs: Paginator_Chart_Value, additional = false): void
    {
        this.addData(logs, 'dev_item', additional);
    }

    addParamValues(params: Paginator_Chart_Value, additional = false): void
    {
        this.addData(params, 'param', additional);
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

        if (this.chartInfo.charts_type === Chart_Type.CT_DIG_TYPE) {
            this.storeScaleParamsToLocalStorage();
        }

        this.axeChange.emit({
            axes: (<any>this.chart.chart).boxes.filter(box => box.id && box.id.length === 1),
            datasets: (<any>this.chart.data).datasets,
        });
    }

    onLabel(item, data): string {
        let text = item.value;
        const dataset = data.datasets[item.datasetIndex];

        const dev_item = dataset['dev_item'];
        if (dev_item)
        {
            const value_view = dev_item.type.views?.find(vv => vv.value == item.value);
            if (value_view)
                text = value_view.view;
        }

        if (dataset.usered_data) {
            const x = dataset.data[item.index].x.getTime();
            const user_id = dataset.usered_data[x];
            if (dataset.usered_data[x]) {
                console.dir(this.members);
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

    setViewportBounds(start: Date | number, end: Date | number, forceUpdate = true) {
        const ticks = this.options.scales.xAxes[0].ticks;
        ticks.min = typeof start === 'number' ? new Date(start) : start;
        ticks.max = typeof end === 'number' ? new Date(end) : end;

        forceUpdate && this.update();
    }

    private applyDatasetChanges(changes?: KeyValueChanges<string, any>) {
        this.update();
    }

    startLoading() {
        this.loading = true;

        this.showProgressBar = true;
        this.progressBarMode = 'indeterminate';
        this.progressBarColor = 'primary';

        this.changeDetectorRef.detectChanges();
    }

    finishedLoading() {
        if (!this.loading) return; // just for safety

        this.loading = false;
        this.progressBarColor = 'primary';
        this.progressBarMode = 'determinate';
        this.progressBarValue = 50;
        this.setProgressBarValueTimeout(100);

        this.changeDetectorRef.detectChanges();

        setTimeout(() => this.hideProgressBar(), 600);
    }

    errorLoading(error: Error) {
        this.loading = false;
        this.progressBarColor = 'warn';
        this.progressBarMode = 'determinate';
        this.setProgressBarValueTimeout(100);

        this.changeDetectorRef.detectChanges();

        setTimeout(() => {
            this.hideProgressBar();
            this.showLoadingError(error);
        }, 1000);
    }

    showLoadingError(error: Error) {
        this.snackBar.open(error.message, 'Hide', {
            duration: 10000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
        });
    }

    hideProgressBar() {
        this.showProgressBar = false;
        this.changeDetectorRef.detectChanges();
    }

    private setProgressBarValueTimeout(number: number) {
        setTimeout(() => {
            this.progressBarValue = number;
            this.changeDetectorRef.detectChanges();
        }, 50);
    }

    private setupYAxisScale(axisKey: string, idx: number) {
        const axis = this.options.scales.yAxes[idx];
        const key = this.getAxisLocalStorageKey(axisKey, axis.id);
        if (!key)
            return;

        const params = ChartItemComponent.loadScaleParamsFromLocalStorage(key);
        if (!params)
            return;

        if (!axis.ticks)
            axis.ticks = {} as any;

        axis.ticks.min = params.min;
        axis.ticks.max = params.max;
    }

    private storeScaleParamsToLocalStorage() {
        const { A: leftYAxis, B: rightYAxis } = (this.chart.chart as any).scales;
        const leftKey = this.getAxisLocalStorageKey(this.leftYAxisLsKey, 'A');
        const rightKey = this.getAxisLocalStorageKey(this.rightYAxisLsKey, 'B');

        leftKey && ChartItemComponent.saveScaleParamsToLocalStorage(leftKey, leftYAxis);
        rightKey && ChartItemComponent.saveScaleParamsToLocalStorage(rightKey, rightYAxis);
    }

    private getAxisLocalStorageKey(axisKey: string, axisId: string) {
        const dataset = this.chartInfo.data.datasets.find(ds => ds.yAxisID === axisId);
        if (!dataset)
            return null;

        const { group_id } = dataset.dev_item || dataset.param;
        return `${axisKey}_${group_id}`;
    }

    private static loadScaleParamsFromLocalStorage(axisKey: string): { min: number, max: number } {
        const json = localStorage.getItem(axisKey);
        if (!json)
            return null;
        return JSON.parse(json);
    }

    private static saveScaleParamsToLocalStorage(axisKey: string, axis: any) {
        localStorage.setItem(axisKey, JSON.stringify({
            min: axis.min,
            max: axis.max,
        }));
    }
}
