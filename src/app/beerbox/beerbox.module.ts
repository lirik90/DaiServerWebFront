import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material.module';
import { BeerboxRoutingModule } from "./beerbox-routing.module";

import { WashComponent } from './wash/wash.component';
import { ReplaceKegComponent, ConfirmDialogReplaceKegComponent } from './replace-keg/replace-keg.component';
import { CalibrationComponent } from './calibration/calibration.component';
import { CheckHeadStandComponent, CheckHeadStandDialogComponent } from './check-head-stand/check-head-stand.component';
import { ReplaceLabelsComponent } from './replace-labels/replace-labels.component';
import { UpdateBeerInfoComponent, EditDialogUpdateBeerInfoComponent } from './update-beer-info/update-beer-info.component';
import { ChangeControllerAddressComponent } from './change-controller-address/change-controller-address.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    BeerboxRoutingModule,
  ],
  declarations: [
    WashComponent, ReplaceKegComponent, ConfirmDialogReplaceKegComponent, CalibrationComponent, CheckHeadStandComponent, CheckHeadStandDialogComponent, ReplaceLabelsComponent, UpdateBeerInfoComponent, EditDialogUpdateBeerInfoComponent, ChangeControllerAddressComponent
  ],
  entryComponents: [
    ConfirmDialogReplaceKegComponent,
	  CheckHeadStandDialogComponent,
    EditDialogUpdateBeerInfoComponent,
  ],
})
export class BeerboxModule { }
