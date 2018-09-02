import { NgModule } from '@angular/core';

import { ChartModule } from 'angular2-chartjs';

import {
  MatButtonModule,
  MatTooltipModule,
  MatSlideToggleModule,
  MatSelectModule,
  MatSliderModule,
  MatInputModule,
  MatDialogModule,
  MatTableModule,
  MatSnackBarModule,

  MatProgressSpinnerModule,
  MatPaginatorModule,
  MatSortModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatRadioModule,
  MatIconModule,

//  MatAutocompleteModule,
//  MatButtonToggleModule,
//  MatCardModule,
  MatCheckboxModule,
//  MatChipsModule,
//  MatDividerModule,
//  MatExpansionModule,
//  MatGridListModule,
  MatListModule,
//  MatMenuModule,
//  MatProgressBarModule,
//  MatRippleModule,
  MatSidenavModule,
  MatStepperModule,
//  MatTabsModule,
  MatToolbarModule,
} from '@angular/material';
import { CdkTableModule } from '@angular/cdk/table';

@NgModule({
  exports: [
    ChartModule,

    MatButtonModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatSelectModule,
    MatInputModule,
    MatDialogModule,
    MatTableModule,
    MatSnackBarModule,

    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatSortModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    MatIconModule,
	  MatToolbarModule,
	  MatSidenavModule,
	  MatListModule,

//    LayoutModule,
//  MatAutocompleteModule,
//  MatButtonToggleModule,
//  MatCardModule,
  MatCheckboxModule,
//  MatChipsModule,
//  MatDividerModule,
//  MatExpansionModule,
//  MatGridListModule,
//  MatMenuModule,
//  MatProgressBarModule,
//  MatRippleModule,
//  MatSnackBarModule,
  MatStepperModule,
//  MatTabsModule,
  ],
  declarations: [],
})
export class MaterialModule {}
