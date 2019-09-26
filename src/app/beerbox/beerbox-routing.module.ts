import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {ReplaceKegComponent} from './replace-keg/replace-keg.component';
import {WashComponent} from './wash/wash.component';
import {CalibrationComponent} from './calibration/calibration.component';
import {CheckHeadStandComponent} from './check-head-stand/check-head-stand.component';
import {ReplaceLabelsComponent} from './replace-labels/replace-labels.component';
import {UpdateBeerInfoComponent} from './update-beer-info/update-beer-info.component';
import {ChangeControllerAddressComponent} from './change-controller-address/change-controller-address.component';
import {OperationHoursComponent} from './operation-hours/operation-hours.component';
import {KegsComponent} from './kegs/kegs.component';
import {LabelConfiguratorComponent} from './label-configurator/label-configurator.component';
import {TapListComponent} from './label-conf/tap-list/tap-list.component';
import {ProjectLoadGuard} from '../house/project-load.guard';
import {PermissionGuard} from '../house/permission.guard';
import {CalVolComponent} from './cal-vol/cal-vol.component';

const beerboxRoutes: Routes = [
  {
    path: '',
    children: [
      {path: 'replace_keg', redirectTo: 'kegs'},
      {path: 'kegs', component: KegsComponent},
      {path: 'wash', component: WashComponent, data: { req_perms: ['can_see_more', 'can_wash'] }, canActivate: [PermissionGuard]},
      {path: 'calibration', component: CalibrationComponent},
      {path: 'cal-vol', component: CalVolComponent},
      {path: 'check-head-stand', component: CheckHeadStandComponent},
      {path: 'replace_labels', component: ReplaceLabelsComponent},
      {path: 'update_beer_info', component: UpdateBeerInfoComponent},
      {path: 'change_controller_address', component: ChangeControllerAddressComponent},
      {path: 'operation_hours', component: OperationHoursComponent},
      {path: 'label-configurator', component: LabelConfiguratorComponent},
      {path: 'label-conf', component: TapListComponent /*loadChildren: 'app/beerbox/label-conf/label-conf.module#LabelConfModule'*/},
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(beerboxRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class BeerboxRoutingModule {
}
