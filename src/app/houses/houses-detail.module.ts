import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from "@angular/router";

import { HouseDetailComponent } from './detail/detail.component';
import {MatFormFieldModule, MatSelectModule} from '@angular/material';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  declarations: [
    HouseDetailComponent
  ],
  exports: [
    HouseDetailComponent
  ]
})
export class HousesDetailModule { }
