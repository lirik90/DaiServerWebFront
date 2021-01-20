import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersAndDevicesComponent } from './users-and-devices/users-and-devices.component';
import { SchemeGroupsComponent } from './scheme-groups/scheme-groups.component';

const routes: Routes = [
    {
        path: '',
        component: SchemeGroupsComponent,
        children: [
            { path: 'users-and-devices/:id', component: UsersAndDevicesComponent },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [
        RouterModule.forChild(routes),
    ],
    exports: [
        RouterModule
    ],
})
export class SchemeGroupsRoutingModule { }
