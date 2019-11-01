import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../auth.guard';
import {NotificationsComponent} from './notifications/notifications.component';
import {UserSettingsComponent} from './user-settings.component';
import {UserDetailsComponent} from './user-details/user-details.component';

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
        redirectTo: 'details'
      },
      {
        path: 'details',
        component: UserDetailsComponent,
      }
    ]
  }
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export class UserSettingsRoutingModule { }
