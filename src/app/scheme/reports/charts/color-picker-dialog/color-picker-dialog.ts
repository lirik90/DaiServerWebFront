import { Component, OnInit, Inject } from '@angular/core';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ColorOutput } from 'ng-color/color-output';

export interface DialogData {
  chart: any;
  dataset: any;
  chart_obj: any;
}

@Component({
  selector: 'color-picker-dialog',
  templateUrl: 'color-picker-dialog.html',
})
export class ColorPickerDialog implements OnInit {
    color: ColorOutput;
    
    constructor(
      public dialogRef: MatDialogRef<ColorPickerDialog>,
      @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

    ngOnInit(): void {
        var match = this.data.dataset.pointBorderColor.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/);
        if (match) {
            let cToHex = (c) => {
                const str = match[c];
                const num = parseInt(str);
                var hex = num.toString(16);
              return hex.length == 1 ? "0" + hex : hex;
            };
            this.color = {
                hexString: `#${cToHex(1)}${cToHex(2)}${cToHex(3)}`
            } as ColorOutput;
        }
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}

