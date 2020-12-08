import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '../material.module';
import { SchemesDetailModule } from '../schemes/schemes-detail.module';

import { SchemeRoutingModule  } from './scheme-routing.module';
import { SchemeComponent, PageReloadDialogComponent } from './scheme.component';

import { SchemeLoadGuard } from "./scheme-load.guard";
import { ControlService } from "./control.service";
import { SchemeService } from "./scheme.service";

import {ManageComponent, ParamsDialogComponent} from './manage/manage.component';
import { LogComponent } from './log/log.component';
import { ParamComponent } from './param/param.component';
import { GroupStatusComponent } from './group-status/group-status.component';
import { DevItemValueComponent, HoldingRegisterDialogComponent } from './dev-item-value/dev-item-value.component';
import { VideoStreamDialogComponent } from './dev-item-value/video-stream-dialog/video-stream-dialog.component';
import { DragScrollComponent } from './drag-scroll.component';
import { ParamItemComponent } from './param-item/param-item.component';

import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { SchemeStateComponent } from './scheme-state/scheme-state.component';
import {SchemeSectionComponent} from './scheme-section/scheme-section.component';
import { DocComponent } from './doc/doc.component';
import {Log2Component} from './log2/log2.component';
import {Manage2Component} from './manage2/manage2.component';
import { StatusManageDialogComponent } from './status-manage-dialog/status-manage-dialog.component';
import { StatusManageItemComponent } from './status-manage-dialog/status-manage-item/status-manage-item.component';
import { HelpItemComponent } from './doc/help-item/help-item.component';
import { NoSanitizePipe } from './no-sanitize.pipe';
import {SidebarService} from './sidebar.service';

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
}

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SchemeRoutingModule,
    MaterialModule,
    SchemesDetailModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ],
  declarations: [
    SchemeComponent,
    PageReloadDialogComponent,
    ManageComponent,
      StatusManageDialogComponent,
    Manage2Component,
    HoldingRegisterDialogComponent,
    VideoStreamDialogComponent,
    LogComponent,
    Log2Component,
    ParamComponent,
    GroupStatusComponent,
    DevItemValueComponent,
    DragScrollComponent,
    DragScrollComponent,
    ParamItemComponent,
    SchemeStateComponent,
    SchemeSectionComponent,
    ParamsDialogComponent,
    DocComponent,
    StatusManageItemComponent,
    HelpItemComponent,
    NoSanitizePipe,
  ],
  entryComponents: [
      PageReloadDialogComponent,
      HoldingRegisterDialogComponent,
      VideoStreamDialogComponent,
      ParamsDialogComponent,
      StatusManageDialogComponent,
  ],
  exports: [
    ParamComponent
  ],
  providers: [
    SchemeLoadGuard,
    ControlService,
    SchemeService,
    SidebarService,
  ]
})
export class SchemeModule {
}
