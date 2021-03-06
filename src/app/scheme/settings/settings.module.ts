import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MaterialModule } from "../../material.module";

import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsService } from './settings.service';

import { SettingsComponent, Scheme_Copy_Dialog } from './settings.component';
import { DevicesComponent, DeviceItemsComponent } from './devices/devices.component';
import { SectionsComponent, GroupsComponent, ParamsInGroupComponent } from './sections/sections.component';
import { GroupTypesComponent, ItemTypesComponent, ParamTypesComponent, StatusesComponent } from './group-types/group-types.component';
import { DIG_Status_Category_Component } from './dig-status-category/dig-status-category.component';
import { SignTypesComponent } from './sign-types/sign-types.component';
import { CodesComponent } from './codes/codes.component';

import { MonacoEditorModule, NgxMonacoEditorConfig, NGX_MONACO_EDITOR_CONFIG } from 'ngx-monaco-editor';
import { PluginTypesComponent } from './plugin-types/plugin-types.component';
import { SaveTimersComponent } from './save-timers/save-timers.component';
import { AceEditorModule } from 'ng2-ace-editor';


const monacoConfig: NgxMonacoEditorConfig = {
  baseUrl: 'static', // configure base path for monaco editor
  defaultOptions: { scrollBeyondLastLine: false }, // pass deafult options to be used
  //onMonacoLoad: () => {} // here monaco object will be avilable as window.monaco use this function to extend monaco editor functionalities.
};

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SettingsRoutingModule,
    MaterialModule,
    MonacoEditorModule,
    AceEditorModule,
    // use forRoot() in main app module only.
  ],
  declarations: [
    SettingsComponent,
    DevicesComponent,
    DeviceItemsComponent,
    SectionsComponent,
    GroupsComponent, ParamsInGroupComponent,
    GroupTypesComponent, ItemTypesComponent, ParamTypesComponent, StatusesComponent ,
    DIG_Status_Category_Component,
    SignTypesComponent,
    CodesComponent,
    PluginTypesComponent,
    SaveTimersComponent,
      Scheme_Copy_Dialog
  ],
  entryComponents: [
      Scheme_Copy_Dialog
  ],
  providers: [
//    SchemeLoadGuard,
//    ControlService,
    SettingsService,
    { provide: NGX_MONACO_EDITOR_CONFIG, useValue: monacoConfig }
  ]
})
export class SettingsModule { }
