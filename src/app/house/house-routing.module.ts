import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from "../auth.guard";
import { ProjectLoadGuard } from "./project-load.guard";

import { HouseDetailComponent } from '../houses/detail/detail.component';

import { HouseComponent } from './house.component';
import { ViewComponent } from './view/view.component';
import { ViewItemComponent } from "./view-item/view-item.component";
import { ManageComponent } from "./manage/manage.component";
import { LogComponent } from "./log/log.component";
import { ParamComponent } from "./param/param.component";

const houseRoutes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { 
        path: ':name', 
        component: HouseComponent,
        canActivate: [ProjectLoadGuard],
        canActivateChild: [AuthGuard, ProjectLoadGuard],
        children: [
          { path: '', redirectTo: '/house/:name/view', pathMatch: 'full' },
          { path: 'detail', component: HouseDetailComponent },
          {
            path: 'view', 
            component: ViewComponent,
            children: [
              { path: '', pathMatch: 'full' },
              { path: ':view_id', component: ViewItemComponent, data: { is_edit: true } }
            ]
          },
          { path: 'manage', component: ManageComponent, data: { is_edit: true }},
          { path: 'log', component: LogComponent },
          { path: 'group/:groupId/param', component: ParamComponent },
          { 
            path: 'reports', 
            loadChildren: 'app/house/reports/reports.module#ReportsModule',
            canLoad: [AuthGuard]
          },
          { 
            path: 'settings', 
            loadChildren: 'app/house/settings/settings.module#SettingsModule',
            canLoad: [AuthGuard]
          },
          { path: 'beerbox', loadChildren: 'app/beerbox/beerbox.module#BeerboxModule', canLoad: [AuthGuard] },
        ]
      } 
    ]
  }
];

@NgModule({
  imports: [ RouterModule.forChild(houseRoutes) ],
  exports: [ RouterModule ]
})
export class HouseRoutingModule {}
