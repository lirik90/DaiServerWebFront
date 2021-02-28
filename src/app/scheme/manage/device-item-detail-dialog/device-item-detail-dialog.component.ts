import {Component, Inject} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Device, Device_Item, Device_Item_Group, Device_Item_Type} from '../../scheme';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {SchemeService} from '../../scheme.service';
import {Structure_Type} from '../../settings/settings';
import {DetailDialog} from '../detail-dialog';
import {DeviceDetailDialogComponent} from '../device-detail-dialog/device-detail-dialog.component';
import {DeviceItemTypeDetailDialogComponent} from '../device-item-type-detail-dialog/device-item-type-detail-dialog.component';

export type Device_Item_Details = Pick<Device_Item, "name" | "device_id" | "type_id" | "extra" | "parent_id">;

@Component({
  selector: 'app-device-item-detail-dialog',
  templateUrl: './device-item-detail-dialog.component.html',
  styleUrls: ['./device-item-detail-dialog.component.css']
})
export class DeviceItemDetailDialogComponent extends DetailDialog<Device_Item, DeviceItemDetailDialogComponent> {
    devItemTypes: Device_Item_Type[];
    devices: Device[];
    groups: Device_Item_Group[];

    constructor(
        fb: FormBuilder,
        @Inject(MAT_DIALOG_DATA) devItem: Device_Item,
        dialogRef: MatDialogRef<DeviceItemDetailDialogComponent>,
        schemeService: SchemeService,
        private dialog: MatDialog,
    ) {
        super(dialogRef, devItem, schemeService, Structure_Type.ST_DEVICE_ITEM, fb);

        this.devItemTypes = this.schemeService.scheme.device_item_type;
        this.devices = this.schemeService.scheme.device;
        this.groups = this.schemeService.scheme.section
            .map(sct => sct.groups)
            .reduce((prev, curr) => {
                prev.push(...curr);
                return prev;
            }, []);

    }

    createFormGroup(): FormGroup {
        return this.fb.group({
            id: [null, []],
            name: ['', []],
            device_id: ['', Validators.required],
            type_id: [null, [Validators.required]],
            group_id: [null, [Validators.required]],
            extra: [null],
            parent_id: [null, []],
        });
    }

    createItem(formValue: any): Device_Item {
        const devItem = new Device_Item();

        Object.assign(devItem, formValue);
        devItem.type = this.devItemTypes.find(t => t.id === devItem.type_id);

        return devItem;
    }

    newDevice() {
        this.dialog.open(DeviceDetailDialogComponent, { width: '80%' })
            .afterClosed()
            .subscribe((device?: Device) => {});
    }

    newItemType() {
        this.dialog.open(DeviceItemTypeDetailDialogComponent, { width: '80%' })
            .afterClosed()
            .subscribe((deviceItemType?: Device_Item_Type) => {});
    }
}
