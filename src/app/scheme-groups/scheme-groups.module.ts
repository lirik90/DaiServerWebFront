import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchemeGroupsListComponent } from './scheme-groups-list/scheme-groups-list.component';
import { SchemeGroupsComponent } from './scheme-groups/scheme-groups.component';
import { UsersAndDevicesComponent } from './users-and-devices/users-and-devices.component';
import { SchemeGroupsRoutingModule } from './scheme-groups-routing.module';
import { MaterialModule } from '../material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CreateNewSchemeGroupComponent } from './create-new-scheme-group/create-new-scheme-group.component';
import { EditSchemeGroupComponent } from './edit-scheme-group/edit-scheme-group.component';
import { ItemSchemeGroupsListComponent } from './item-scheme-groups-list/item-scheme-groups-list.component';

@NgModule({
    declarations: [
        SchemeGroupsListComponent,
        SchemeGroupsComponent,
        UsersAndDevicesComponent,
        CreateNewSchemeGroupComponent,
        EditSchemeGroupComponent,
        ItemSchemeGroupsListComponent,
    ],
    imports: [
        CommonModule,
        SchemeGroupsRoutingModule,
        MaterialModule,
        ReactiveFormsModule,
    ],
    exports: [
        SchemeGroupsComponent,
        ItemSchemeGroupsListComponent,
    ],
})
export class SchemeGroupsModule { }
