import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ReplaceKegComponent } from "./replace-keg/replace-keg.component";
import { WashComponent } from "./wash/wash.component";

const beerboxRoutes: Routes = [
  { 
    path: '', 
    children: [
      { path: 'replace_keg', component: ReplaceKegComponent },
      { path: 'wash', component: WashComponent },
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(beerboxRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class BeerboxRoutingModule { }
