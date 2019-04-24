import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from "@angular/router";

import { HouseDetailComponent } from './detail/detail.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule    
  ],
  declarations: [
    HouseDetailComponent
  ],
  exports: [
    HouseDetailComponent
  ]
})
export class HousesDetailModule { }
