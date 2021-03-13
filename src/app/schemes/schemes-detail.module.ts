import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { RouterModule } from "@angular/router";

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

import { SchemeDetailComponent } from './detail/detail.component';
import { SchemeStateListComponent } from './scheme-state-list/scheme-state-list.component';
import {MaterialModule} from '../material.module';
import {SchemeGroupsModule} from '../scheme-groups/scheme-groups.module';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        MatFormFieldModule,
        MatSelectModule,
        MatIconModule,
        MaterialModule,
        ReactiveFormsModule,
        SchemeGroupsModule
    ],
  declarations: [
    SchemeDetailComponent,
    SchemeStateListComponent,
  ],
  exports: [
    SchemeDetailComponent,
    SchemeStateListComponent,
  ]
})
export class SchemesDetailModule { }
