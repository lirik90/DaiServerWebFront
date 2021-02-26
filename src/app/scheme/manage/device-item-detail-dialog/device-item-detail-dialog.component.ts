import {Component, Inject} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Device, Device_Item, Device_Item_Group, Device_Item_Type} from '../../scheme';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {SchemeService} from '../../scheme.service';
import {DeviceDetailDialogComponent} from '../device-detail-dialog/device-detail-dialog.component';
import {DeviceItemTypeDetailDialogComponent} from '../device-item-type-detail-dialog/device-item-type-detail-dialog.component';
import {Structure_Type} from '../../settings/settings';

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
    groups: Device_Item_Group[];

    constructor(
        fb: FormBuilder,
        @Inject(MAT_DIALOG_DATA) private devItem: Device_Item,
        private dialogRef: MatDialogRef<DeviceItemDetailDialogComponent>,
        private dialog: MatDialog,
        private schemeService: SchemeService,
    ) {
        this.devItemTypes = this.schemeService.scheme.device_item_type;
        this.devices = this.schemeService.scheme.device;
        this.groups = this.schemeService.scheme.section
            .map(sct => sct.groups)
            .reduce((prev, curr) => {
                prev.push(...curr);
                return prev;
            }, []);

        this.fg = fb.group({
            id: [null, []],
            name: ['', []],
            device_id: ['', Validators.required],
            type_id: [null, [Validators.required]],
            group_id: [null, [Validators.required]],
            extra: [null],
            parent_id: [null, []],
        });

        if (this.devItem) {
            this.fg.patchValue(this.devItem);
        }
    }

    submit() {
        if (this.fg.invalid) return;

        const devItem = new Device_Item();
        Object.assign(devItem, this.fg.value);
        devItem.type = this.devItemTypes.find(t => t.id === devItem.type_id);

        this.schemeService.upsert_structure(Structure_Type.ST_DEVICE_ITEM, devItem, this.devItem?.id ? this.devItem : null)
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
            .subscribe((deviceItemType?: Device_Item_Type) => {});
    }

    newDevice() {
        this.dialog.open(DeviceDetailDialogComponent, { width: '80%' })
            .afterClosed()
            .subscribe((device?: Device) => {});
    }
}
