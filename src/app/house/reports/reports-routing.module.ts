import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from "../../auth.guard";
import { ProjectLoadGuard } from "../project-load.guard";

import { ReportsComponent } from "./reports.component";
import { ChartsComponent } from "./charts/charts.component";
import { ExportComponent } from "./export/export.component";

const reportRoutes: Routes = [
  {
    path: '',
    component: ReportsComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard, ProjectLoadGuard],
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
