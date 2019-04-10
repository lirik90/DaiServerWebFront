import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent }   from './houses/dashboard/dashboard.component';
import { HouseListComponent } from './houses/list/list.component';
import { HouseDetailComponent } from './houses/detail/detail.component';
import { AuthGuard } from './auth.guard';
import { RegisterComponent } from "./register/register.component";
import { LoginComponent } from "./login/login.component";

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full'},
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]  },
  { path: 'list', component: HouseListComponent, canActivate: [AuthGuard]  },
  { path: 'detail/:name', component: HouseDetailComponent, canActivate: [AuthGuard]  },

  { 
    path: 'house', 
    loadChildren: 'app/house/house.module#HouseModule',
    canLoad: [AuthGuard]
  },

  // otherwise redirect to home
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes /*, { enableTracing: true }*/ ) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
