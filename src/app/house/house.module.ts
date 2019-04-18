import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '../material.module';
import { HousesDetailModule } from '../houses/houses-detail.module';

import { HouseRoutingModule  } from './house-routing.module';
import { HouseComponent } from './house.component';

import { ProjectLoadGuard } from "./project-load.guard";
import { ControlService } from "./control.service";
import { HouseService } from "./house.service";

import { ViewComponent } from './view/view.component';
import { ManageComponent } from './manage/manage.component';
import { LogComponent } from './log/log.component';
import { ParamComponent } from './param/param.component';
import { GroupStatusComponent } from './group-status/group-status.component';
import { DevItemValueComponent, HoldingRegisterDialogComponent } from './dev-item-value/dev-item-value.component';
import { DragScrollComponent } from './drag-scroll.component';
import { ViewItemComponent } from './view-item/view-item.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HouseRoutingModule,
    MaterialModule,
    HousesDetailModule,
  ],
  declarations: [
    HouseComponent,
    ViewComponent,
    ManageComponent,
    HoldingRegisterDialogComponent,
    LogComponent,
    ParamComponent,
    GroupStatusComponent,
    DevItemValueComponent,
    DragScrollComponent,
    ViewItemComponent,
  ],
  entryComponents: [
    HoldingRegisterDialogComponent,
  ],
  providers: [
    ProjectLoadGuard,
    ControlService,
    HouseService,
  ]
})
export class HouseModule {
}
