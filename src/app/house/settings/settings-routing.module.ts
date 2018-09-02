import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from "../../auth.guard";
import { ProjectLoadGuard } from "../project-load.guard";

import { SettingsComponent } from "./settings.component";
import { DevicesComponent } from "./devices/devices.component";
import { SectionsComponent } from "./sections/sections.component";
import { GroupTypesComponent } from "./group-types/group-types.component";
import { StatusTypesComponent } from "./status-types/status-types.component";
import { SignTypesComponent } from "./sign-types/sign-types.component";
import { CodeComponent, CodesComponent } from "./code/code.component";

const settingsRoutes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: SettingsComponent,
    children: [
      { path: '', pathMatch: 'full' },
      { path: 'devices', component: DevicesComponent },
      { 
        path: 'sections', 
        children: [
          { path: '', component: SectionsComponent, pathMatch: 'full' },
          { 
            path: ':sctId', 
            children: [
              { path: '', component: SectionsComponent, pathMatch: 'full' },
              { path: 'group/:groupId', component: SectionsComponent },
            ]
          }
        ]
      },
      { path: 'grouptypes', component: GroupTypesComponent },
      { path: 'statustypes', component: StatusTypesComponent },
      { path: 'signtypes', component: SignTypesComponent },
      { 
        path: 'code', 
        children: [
          { path: '', component: CodeComponent, pathMatch: 'full' },
          { path: ':codeId', component: CodeComponent }
        ]
      },
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(settingsRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class SettingsRoutingModule { }
