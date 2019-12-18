import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '../material.module';
import { HousesDetailModule } from '../houses/houses-detail.module';

import { HouseRoutingModule  } from './house-routing.module';
import { HouseComponent, PageReloadDialogComponent } from './house.component';

import { ProjectLoadGuard } from "./project-load.guard";
import { ControlService } from "./control.service";
import { HouseService } from "./house.service";

import { ViewComponent } from './view/view.component';
import {ManageComponent, ParamsDialogComponent} from './manage/manage.component';
import { LogComponent } from './log/log.component';
import { ParamComponent } from './param/param.component';
import { GroupStatusComponent } from './group-status/group-status.component';
import { DevItemValueComponent, HoldingRegisterDialogComponent } from './dev-item-value/dev-item-value.component';
import { DragScrollComponent } from './drag-scroll.component';
import { ParamItemComponent } from './param-item/param-item.component';

import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HouseStateComponent } from './house-state/house-state.component';
import {HouseSectionComponent} from './house-section/house-section.component';
import { DocComponent } from './doc/doc.component';
import {Log2Component} from './log2/log2.component';
import {Manage2Component} from './manage2/manage2.component';

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
}

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HouseRoutingModule,
    MaterialModule,
    HousesDetailModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ],
  declarations: [
    HouseComponent,
    PageReloadDialogComponent,
    ViewComponent,
    ManageComponent,
    Manage2Component,
    HoldingRegisterDialogComponent,
    LogComponent,
    Log2Component,
    ParamComponent,
    GroupStatusComponent,
    DevItemValueComponent,
    DragScrollComponent,
    DragScrollComponent,
    ParamItemComponent,
    HouseStateComponent,
    HouseSectionComponent,
    ParamsDialogComponent,
    DocComponent,
  ],
  entryComponents: [
    PageReloadDialogComponent,
    HoldingRegisterDialogComponent,
    ParamsDialogComponent,
  ],
  exports: [
    ParamComponent
  ],
  providers: [
    ProjectLoadGuard,
    ControlService,
    HouseService,
  ]
})
export class HouseModule {
}
