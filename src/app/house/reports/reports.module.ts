import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '../../material.module';

import { ReportsRoutingModule } from "./reports-routing.module";
import { ReportsComponent } from './reports.component';
import { ChartsComponent } from './charts/charts.component';
import { ExportComponent } from './export/export.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ReportsRoutingModule,
    MaterialModule,
  ],
  declarations: [
    ReportsComponent,
    ChartsComponent,
    ExportComponent,
  ],
  entryComponents: [
  ],
})
export class ReportsModule { }
