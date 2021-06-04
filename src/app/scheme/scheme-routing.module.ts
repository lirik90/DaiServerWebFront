import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {AuthGuard} from '../auth.guard';
import {SchemeLoadGuard} from './scheme-load.guard';

import {SchemeDetailComponent} from '../schemes/detail/detail.component';

import {SchemeComponent} from './scheme.component';
import {ManageComponent} from './manage/manage.component';
import {LogComponent} from './log/log.component';
import {ReportsModule} from './reports/reports.module';
import {PermissionGuard} from './permission.guard';
import {DocComponent} from './doc/doc.component';
import {ElementsComponent} from './elements/elements.component';
import {ManageDevicesComponent} from './manage-devices/manage-devices.component';
import { MnemoschemeComponent } from './mnemoscheme/mnemoscheme.component';

const schemeRoutes: Routes = [{
    path: '',
    canActivate: [AuthGuard],
    children: [{
        path: ':name',
        component: SchemeComponent,
        canActivate: [SchemeLoadGuard],
        canActivateChild: [AuthGuard, SchemeLoadGuard, PermissionGuard],
        children: [
            {path: '', redirectTo: 'detail', pathMatch: 'full'},
            {path: 'detail', component: SchemeDetailComponent, data: {req_perms: true}},
            {
                path: 'elements', component: ElementsComponent, data: { req_perms: true }, children: [
                    { path: 'sections', component: ManageComponent },
                    { path: 'devices', component: ManageDevicesComponent },
                    { path: '', pathMatch: 'full', redirectTo: 'sections' },
                ]
            },
            {path: 'elements/sections', component: ManageComponent, data: {req_perms: true}},
            {path: 'elements/devices', component: ManageDevicesComponent, data: {req_perms: true}},
            {path: 'elements', pathMatch: 'full', redirectTo: 'elements/sections'},
            {path: 'mnemoscheme', component: MnemoschemeComponent},
            {path: 'log_event', component: LogComponent, data: {req_perms: true}},
            {path: 'help', component: DocComponent, data: {req_perms: true}},
            // { path: 'group/:groupId/param', component: ParamComponent },
            {
                path: 'reports',
                loadChildren: () => import('app/scheme/reports/reports.module').then(m => m.ReportsModule),
                canLoad: [AuthGuard],
                data: {req_perms: true}
            },
            {
                path: 'structure',
                loadChildren: () => import('app/scheme/settings/settings.module').then(m => m.SettingsModule),
                data: {req_perms: true},
                canLoad: [AuthGuard]
            },
        ]
    }]
}];

@NgModule({
    imports: [ReportsModule, RouterModule.forChild(schemeRoutes)],
    exports: [RouterModule]
})
export class SchemeRoutingModule {
}
