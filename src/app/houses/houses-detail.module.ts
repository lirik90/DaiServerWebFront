import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from "@angular/router";

import { HouseDetailComponent } from './detail/detail.component';
import {MatFormFieldModule, MatSelectModule} from '@angular/material';
import { HouseStateListComponent } from './house-state-list/house-state-list.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  declarations: [
    HouseDetailComponent,
    HouseStateListComponent
  ],
  exports: [
    HouseDetailComponent,
    HouseStateListComponent
  ]
})
export class HousesDetailModule { }
