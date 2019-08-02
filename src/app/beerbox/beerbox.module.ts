import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material.module';
import { BeerboxRoutingModule } from "./beerbox-routing.module";

import { WashComponent } from './wash/wash.component';
import { ReplaceKegComponent, ConfirmDialogReplaceKegComponent } from './replace-keg/replace-keg.component';
import { CalibrationComponent } from './calibration/calibration.component';
import { CheckHeadStandComponent, CheckHeadStandDialogComponent } from './check-head-stand/check-head-stand.component';
import {OkDialogComponent, ReplaceLabelsComponent} from './replace-labels/replace-labels.component';
import { UpdateBeerInfoComponent, EditDialogUpdateBeerInfoComponent, EditDialogManufacturersListComponent } from './update-beer-info/update-beer-info.component';
import { ChangeControllerAddressComponent } from './change-controller-address/change-controller-address.component';

import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { OperationHoursComponent } from './operation-hours/operation-hours.component';
import { KegsComponent } from './kegs/kegs.component';
import {HouseModule} from '../house/house.module';

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    BeerboxRoutingModule,
    TranslateModule.forChild({
        loader: {
            provide: TranslateLoader,
            useFactory: (createTranslateLoader),
            deps: [HttpClient]
        }
    })
  ],
  declarations: [
    WashComponent, ReplaceKegComponent, ConfirmDialogReplaceKegComponent, CalibrationComponent, CheckHeadStandComponent, CheckHeadStandDialogComponent, ReplaceLabelsComponent, UpdateBeerInfoComponent, EditDialogUpdateBeerInfoComponent, EditDialogManufacturersListComponent, ChangeControllerAddressComponent, OperationHoursComponent, KegsComponent, OkDialogComponent
  ],
  entryComponents: [
    ConfirmDialogReplaceKegComponent,
	  CheckHeadStandDialogComponent,
    EditDialogUpdateBeerInfoComponent,
    EditDialogManufacturersListComponent,
    OkDialogComponent
  ],
})
export class BeerboxModule { }
