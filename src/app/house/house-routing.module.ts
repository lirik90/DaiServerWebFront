import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../auth.guard';
import { ProjectLoadGuard } from './project-load.guard';

import { HouseDetailComponent } from '../houses/detail/detail.component';

import { HouseComponent } from './house.component';
import { ViewComponent } from './view/view.component';
import { ManageComponent } from './manage/manage.component';
import { LogComponent } from './log/log.component';
import { ParamComponent } from './param/param.component';
import {ExportComponent} from './reports/export/export.component';
import {ReportsModule} from './reports/reports.module';
import {PermissionGuard} from './permission.guard';

const houseRoutes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: ':name',
        component: HouseComponent,
        canActivate: [ProjectLoadGuard],
        canActivateChild: [AuthGuard, ProjectLoadGuard, PermissionGuard],
        children: [
          { path: '', redirectTo: 'detail', pathMatch: 'full' },
          { path: 'detail', component: HouseDetailComponent },
          {
            path: 'manage',
            component: ViewComponent,
            data: { req_perms: ['can_see_more'] },
            children: [
              { path: '', pathMatch: 'full' },
              { path: ':view_id', component: ManageComponent, data: { is_edit: true, is_view: true } }
            ]
          },
          { path: 'elements', component: ManageComponent, data: { is_edit: true, req_perms: ['can_see_more'] }},
          { path: 'log', component: LogComponent, data: { req_perms: ['can_see_more'] }, },
          { path: 'group/:groupId/param', component: ParamComponent },
          {
            path: 'reports',
            loadChildren: 'app/house/reports/reports.module#ReportsModule',
            canLoad: [AuthGuard]
          },
          {
            path: 'export',
            component: ExportComponent,
            data: {dataPreselected: [107]}
          },
          {
            path: 'settings',
            loadChildren: 'app/house/settings/settings.module#SettingsModule',
            data: { req_perms: ['can_see_more'] },
            canLoad: [AuthGuard]
          },
          { path: 'beerbox', loadChildren: 'app/beerbox/beerbox.module#BeerboxModule', canLoad: [AuthGuard] },
        ]
      }
    ]
  }
];

@NgModule({
  imports: [ ReportsModule, RouterModule.forChild(houseRoutes) ],
  exports: [ RouterModule ]
})
export class HouseRoutingModule {}
