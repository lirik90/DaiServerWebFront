import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {AuthGuard} from '../../auth.guard';
import {SchemeLoadGuard} from '../scheme-load.guard';

import {ReportsComponent} from './reports.component';
import {ChartsComponent} from './charts/charts.component';
import {ExportComponent} from './export/export.component';
import {ChartFilterComponent} from './charts/chart-filter/chart-filter.component';

const reportRoutes: Routes = [
    {
        path: '',
        component: ReportsComponent,
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard, SchemeLoadGuard],
        children: [
            {path: '', redirectTo: 'charts', pathMatch: 'full'},
            {
                path: 'charts',
                component: ChartsComponent,
                data: { title: 'NAVIGATION.SCHEME.CHARTS' },
            },
            {
                path: 'export',
                component: ExportComponent,
                data: { title: 'NAVIGATION.SCHEME.EXPORT' },
            },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(reportRoutes)],
    exports: [RouterModule]
})
export class ReportsRoutingModule {
}
