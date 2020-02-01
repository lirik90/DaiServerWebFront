import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from "@angular/router";

import { SchemeDetailComponent } from './detail/detail.component';
import {MatFormFieldModule, MatSelectModule} from '@angular/material';
import { SchemeStateListComponent } from './scheme-state-list/scheme-state-list.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  declarations: [
    SchemeDetailComponent,
    SchemeStateListComponent
  ],
  exports: [
    SchemeDetailComponent,
    SchemeStateListComponent
  ]
})
export class SchemesDetailModule { }
