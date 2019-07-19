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
import { ManageComponent } from './manage/manage.component';
import { LogComponent } from './log/log.component';
import { ParamComponent } from './param/param.component';
import { GroupStatusComponent } from './group-status/group-status.component';
import { DevItemValueComponent, HoldingRegisterDialogComponent } from './dev-item-value/dev-item-value.component';
import { DragScrollComponent } from './drag-scroll.component';
import { ParamItemComponent } from './param-item/param-item.component';

import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import {UIService} from '../ui.service';

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
    })
  ],
  declarations: [
    HouseComponent,
    PageReloadDialogComponent,
    ViewComponent,
    ManageComponent,
    HoldingRegisterDialogComponent,
    LogComponent,
    ParamComponent,
    GroupStatusComponent,
    DevItemValueComponent,
    DragScrollComponent,
    DragScrollComponent,
    ParamItemComponent,
  ],
  entryComponents: [
    PageReloadDialogComponent,
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
