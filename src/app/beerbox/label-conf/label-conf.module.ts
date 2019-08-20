import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TapListComponent } from './tap-list/tap-list.component';
import { LabelComponent } from './label/label.component';
import { LabelElementTextComponent } from './label/label-element-text/label-element-text.component';

@NgModule({
  declarations: [TapListComponent, LabelComponent, LabelElementTextComponent],
  imports: [
    CommonModule
  ],
  entryComponents: [LabelElementTextComponent]
})
export class LabelConfModule { }
