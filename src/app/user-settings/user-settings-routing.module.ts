import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../auth.guard';
import {NotificationsComponent} from './notifications/notifications.component';
import {UserSettingsComponent} from './user-settings.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    component: UserSettingsComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'notifications'
      },
      {
        path: 'notifications',
        component: NotificationsComponent,
      }
    ]
  }
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export class UserSettingsRoutingModule { }
