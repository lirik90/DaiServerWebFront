import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Device_Item, Device_Item_Type} from '../../scheme';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {SchemeService} from '../../scheme.service';

export type Device_Item_Details = Pick<Device_Item, "name" | "device_id" | "type_id" | "extra" | "parent_id">;

@Component({
  selector: 'app-device-item-detail-dialog',
  templateUrl: './device-item-detail-dialog.component.html',
  styleUrls: ['./device-item-detail-dialog.component.css']
})
export class DeviceItemDetailDialogComponent {
    fg: FormGroup;
    devItemTypes: Device_Item_Type[];

    constructor(
        fb: FormBuilder,
        @Inject(MAT_DIALOG_DATA) private devItem: Device_Item,
        private dialogRef: MatDialogRef<DeviceItemDetailDialogComponent>,
        private schemeService: SchemeService,
    ) {
        this.devItemTypes = this.schemeService.scheme.device_item_type;

        this.fg = fb.group({
            name: ['', []],
            device_id: ['', Validators.required],
            type_id: [null, [Validators.required]],
            extra: [null],
            parent_id: ['', []],
        });

        if (this.devItem) {
            this.fg.patchValue(this.devItem);
        }
    }

    submit() {
        if (this.fg.invalid) return;

        this.dialogRef.close(this.fg.value);
    }

    cancel() {
        this.dialogRef.close(null);
    }
}
