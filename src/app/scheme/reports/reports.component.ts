import {Component, ComponentFactoryResolver, ComponentRef, EventEmitter, OnInit, ViewContainerRef} from '@angular/core';
import {NeedSidebar} from '../sidebar.service';
import {ChartFilterComponent} from './charts/chart-filter/chart-filter.component';
import {ChartsComponent} from './charts/charts.component';
import {ExportComponent} from './export/export.component';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit, NeedSidebar {
    private filterRef: ComponentRef<ChartFilterComponent>;

    constructor(private resolver: ComponentFactoryResolver) {}

    ngOnInit() {
    }

    getSidebarWidget(viewContainerRef: ViewContainerRef): ComponentRef<any> {
        const factory = this.resolver.resolveComponentFactory(ChartFilterComponent);
        this.filterRef = viewContainerRef.createComponent(factory);

        return this.filterRef;
    }
}
