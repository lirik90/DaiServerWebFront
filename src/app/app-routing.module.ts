import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent }   from './schemes/dashboard/dashboard.component';
import { SchemeListComponent } from './schemes/list/list.component';
import { SchemeDetailComponent } from './schemes/detail/detail.component';
import { AuthGuard } from './auth.guard';
import { RegisterComponent } from "./register/register.component";
import { LoginComponent } from "./login/login.component";
import { TgAuthComponent } from './tg-auth/tg-auth.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full'},
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]  },
  { path: 'list', component: SchemeListComponent, canActivate: [AuthGuard]  },
  { path: 'detail/:name', component: SchemeDetailComponent, canActivate: [AuthGuard]  },
  {
      path: 'scheme-groups',
      loadChildren: () => import('app/scheme-groups/scheme-groups.module').then(m => m.SchemeGroupsModule),
      canLoad: [AuthGuard],
  },
  {
    path: 'scheme',
    loadChildren: () => import('app/scheme/scheme.module').then(m => m.SchemeModule),
    canLoad: [AuthGuard]
  },
  {
      path: 'user',
      loadChildren: () => import('app/user-settings/user-settings.module').then(m => m.UserSettingsModule),
      canActivate: [AuthGuard],
  },

  { path: 'tg_auth/:token', component: TgAuthComponent, canActivate: [AuthGuard]  },

  // otherwise redirect to home
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes , { enableTracing: true } ) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
