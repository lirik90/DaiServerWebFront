import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Device_Item_Group, DIG_Mode_Type, DIG_Type} from '../../scheme';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SchemeService} from '../../scheme.service';

export type Device_Item_Group_Details = Pick<Device_Item_Group, "title" | "type_id" | "mode">;

@Component({
    selector: 'app-device-item-group-detail-dialog',
    templateUrl: './device-item-group-detail-dialog.component.html',
    styleUrls: ['./device-item-group-detail-dialog.component.css']
})
export class DeviceItemGroupDetailDialogComponent {
    groupTypes: DIG_Type[];
    groupModes: DIG_Mode_Type[];

    fg: FormGroup;

    constructor(
        fb: FormBuilder,
        private dialogRef: MatDialogRef<DeviceItemGroupDetailDialogComponent>,
        private schemeService: SchemeService,
        @Inject(MAT_DIALOG_DATA) private devItemGroup: Device_Item_Group,
    ) {
        this.groupTypes = this.schemeService.scheme.dig_type;
        this.groupModes = this.schemeService.scheme.dig_mode_type;

        this.fg = fb.group({
            title: ['', [Validators.required]],
            type_id: [null, [Validators.required]],
            mode: [null, [Validators.required]],
        });

        if (this.devItemGroup) {
            this.fg.patchValue(this.devItemGroup);
        }
    }

    submit() {
        if (this.fg.invalid) return;

        this.dialogRef.close(this.fg.value as Device_Item_Group);
    }

    cancel() {
        this.dialogRef.close(null);
    }
}
