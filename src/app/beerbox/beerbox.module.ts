import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from '../material.module';
import {BeerboxRoutingModule} from './beerbox-routing.module';

import {WashComponent} from './wash/wash.component';
import {ConfirmDialogReplaceKegComponent, ReplaceKegComponent} from './replace-keg/replace-keg.component';
import {CalibrationComponent} from './calibration/calibration.component';
import {CheckHeadStandComponent, CheckHeadStandDialogComponent} from './check-head-stand/check-head-stand.component';
import {OkDialogComponent, ReplaceLabelsComponent} from './replace-labels/replace-labels.component';
import {
  EditDialogManufacturersListComponent,
  EditDialogUpdateBeerInfoComponent,
  UpdateBeerInfoComponent
} from './update-beer-info/update-beer-info.component';
import {ChangeControllerAddressComponent} from './change-controller-address/change-controller-address.component';

import {HttpClient} from '@angular/common/http';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {OperationHoursComponent} from './operation-hours/operation-hours.component';
import {BrandChangeDialogComponent, KegsComponent} from './kegs/kegs.component';
import {LabelConfiguratorComponent} from './label-configurator/label-configurator.component';
import {NgxBarcodeModule} from 'ngx-barcode';
import {WashTapComponent} from './wash-tap/wash-tap.component';
import {LabelConfModule} from './label-conf/label-conf.module';
import {CalVolComponent} from './cal-vol/cal-vol.component';
import {
  BrandEditDialogComponent,
  BrandsComponent,
  DistribAddDialogComponent,
  ProdAddDialogComponent,
  BrandViewDialogComponent,
  ConfirmEditDialogComponent
} from './brands/brands.component';
import {WifiComponent} from './wifi/wifi.component';
import {PourSettingsComponent} from './pour-settings/pour-settings.component';
import {MatAutocompleteModule} from '@angular/material';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    MatAutocompleteModule,
    BeerboxRoutingModule,
    LabelConfModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    NgxBarcodeModule,
    MatAutocompleteModule,
  ],
  declarations: [
    WashComponent, ReplaceKegComponent, ConfirmDialogReplaceKegComponent, CalibrationComponent, CheckHeadStandComponent,
    CheckHeadStandDialogComponent, ReplaceLabelsComponent, UpdateBeerInfoComponent, EditDialogUpdateBeerInfoComponent,
    EditDialogManufacturersListComponent, ChangeControllerAddressComponent, OperationHoursComponent, KegsComponent, OkDialogComponent,
    LabelConfiguratorComponent, WashTapComponent, CalVolComponent, BrandsComponent, WifiComponent, PourSettingsComponent,
    BrandEditDialogComponent, ProdAddDialogComponent, DistribAddDialogComponent, BrandViewDialogComponent, ConfirmEditDialogComponent,
    BrandChangeDialogComponent
  ],
  entryComponents: [
    ConfirmDialogReplaceKegComponent,
    CheckHeadStandDialogComponent,
    EditDialogUpdateBeerInfoComponent,
    EditDialogManufacturersListComponent,
    OkDialogComponent,
    BrandEditDialogComponent,
    ProdAddDialogComponent, DistribAddDialogComponent, BrandViewDialogComponent, ConfirmEditDialogComponent, BrandChangeDialogComponent
  ],
})
export class BeerboxModule {
}
