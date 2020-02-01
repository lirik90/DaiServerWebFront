import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from "../../auth.guard";
import { SchemeLoadGuard } from "../scheme-load.guard";

import { ReportsComponent } from "./reports.component";
import { ChartsComponent } from "./charts/charts.component";
import { ExportComponent } from "./export/export.component";

const reportRoutes: Routes = [
  {
    path: '',
    component: ReportsComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard, SchemeLoadGuard],
    children: [
      { path: '', redirectTo: 'charts', pathMatch: 'full' },
      { path: 'charts', component: ChartsComponent },
      { path: 'export', component: ExportComponent },
    ]
  }
];

@NgModule({
  imports: [ RouterModule.forChild(reportRoutes) ],
  exports: [ RouterModule ]
})
export class ReportsRoutingModule {}
