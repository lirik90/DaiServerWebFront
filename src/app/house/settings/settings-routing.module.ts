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
import { CodesComponent } from "./codes/codes.component";
import { CheckerTypesComponent } from "./checker-types/checker-types.component";
import { ViewsComponent } from "./views/views.component";
import { SaveTimersComponent } from "./save-timers/save-timers.component";

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
      { path: 'checkertypes', component: CheckerTypesComponent },
      { path: 'views', component: ViewsComponent },
      { path: 'savetimers', component: SaveTimersComponent },
      { path: 'codes', component: CodesComponent },
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
