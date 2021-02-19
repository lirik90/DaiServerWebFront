import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Device, Device_Item, Device_Item_Type} from '../../scheme';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {SchemeService} from '../../scheme.service';
import {DeviceDetailDialogComponent} from '../device-detail-dialog/device-detail-dialog.component';
import {DeviceItemTypeDetailDialogComponent} from '../device-item-type-detail-dialog/device-item-type-detail-dialog.component';

export type Device_Item_Details = Pick<Device_Item, "name" | "device_id" | "type_id" | "extra" | "parent_id">;

@Component({
  selector: 'app-device-item-detail-dialog',
  templateUrl: './device-item-detail-dialog.component.html',
  styleUrls: ['./device-item-detail-dialog.component.css']
})
export class DeviceItemDetailDialogComponent {
    fg: FormGroup;
    devItemTypes: Device_Item_Type[];
    devices: Device[];

    constructor(
        fb: FormBuilder,
        @Inject(MAT_DIALOG_DATA) private devItem: Device_Item,
        private dialogRef: MatDialogRef<DeviceItemDetailDialogComponent>,
        private dialog: MatDialog,
        private schemeService: SchemeService,
    ) {
        this.devItemTypes = this.schemeService.scheme.device_item_type;
        this.devices = this.schemeService.scheme.device;

        this.fg = fb.group({
            id: [null, []],
            name: ['', []],
            device_id: ['', Validators.required],
            type_id: [null, [Validators.required]],
            extra: [null],
            parent_id: ['', []],
            group_id: [null, []],
        });

        if (this.devItem) {
            this.fg.patchValue(this.devItem);
        }
    }

    submit() {
        if (this.fg.invalid) return;

        this.schemeService.modify_structure('device_item', [{ ...this.fg.value }])
            .subscribe(() => {
                this.dialogRef.close(this.fg.value);
            });
    }

    cancel() {
        this.dialogRef.close(null);
    }

    newItemType() {
        this.dialog.open(DeviceItemTypeDetailDialogComponent, { width: '80%' })
            .afterClosed()
            .subscribe((deviceItemType?: Device_Item_Type) => {
                if (!deviceItemType) return;

                // TODO: may be push device item to device item types list
            });
    }

    newDevice() {
        this.dialog.open(DeviceDetailDialogComponent, { width: '80%' })
            .afterClosed()
            .subscribe((device?: Device) => {
                if (!device) return;

                // TODO: may be push device to devices list
            });
    }
}
