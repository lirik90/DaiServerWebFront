import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchemeGroupsListComponent } from './scheme-groups-list/scheme-groups-list.component';
import { SchemeGroupsComponent } from './scheme-groups/scheme-groups.component';
import { UsersAndDevicesComponent } from './users-and-devices/users-and-devices.component';
import { SchemeGroupsRoutingModule } from './scheme-groups-routing.module';
import { MaterialModule } from '../material.module';
import {ReactiveFormsModule} from '@angular/forms';

@NgModule({
    declarations: [
        SchemeGroupsListComponent,
        SchemeGroupsComponent,
        UsersAndDevicesComponent,
    ],
    imports: [
        CommonModule,
        SchemeGroupsRoutingModule,
        MaterialModule,
        ReactiveFormsModule,
    ],
    exports: [
        SchemeGroupsComponent,
    ],
})
export class SchemeGroupsModule { }
