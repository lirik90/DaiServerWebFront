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
import {DocCommand} from '@angular/cli/commands/doc-impl';
import {DocComponent} from './doc/doc.component';

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
          { path: 'detail', component: HouseDetailComponent},
          {
            path: 'manage',
            component: ViewComponent,
            data: { req_perms: ['isAdmin'] },
            children: [
              { path: '', pathMatch: 'full' },
              { path: ':view_id', component: ManageComponent, data: { is_edit: true, is_view: true } }
            ]
          },
          { path: 'elements', component: ManageComponent, data: { req_perms: ['isAdmin'] }},
          { path: 'log', component: LogComponent, data: { req_perms: ['isSupervisor', 'isFullAccess', 'isAdmin'] }},
          { path: 'group/:groupId/param', component: ParamComponent },
          {
            path: 'reports',
            loadChildren: 'app/house/reports/reports.module#ReportsModule',
            canLoad: [AuthGuard],
            data: { req_perms: ['isAdmin'] }
          },
          {
            path: 'export',
            component: ExportComponent,
            data: {dataPreselected: [107], req_perms: ['isSupervisor', 'isFullAccess', 'isAdmin'] }
          },
          {
            path: 'settings',
            loadChildren: 'app/house/settings/settings.module#SettingsModule',
            data: { req_perms: ['isAdmin'] },
            canLoad: [AuthGuard]
          },
          { path: 'beerbox', loadChildren: 'app/beerbox/beerbox.module#BeerboxModule', canLoad: [AuthGuard] },
          {
            path: 'doc',
            component: DocComponent,
          },
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
