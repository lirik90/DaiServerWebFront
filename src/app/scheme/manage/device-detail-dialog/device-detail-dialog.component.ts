import {Component, Inject} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Device, Plugin_Type} from '../../scheme';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {SettingsService} from '../../settings.service';
import {SchemeService} from '../../scheme.service';
import {Structure_Type} from '../../settings/settings';
import {DetailDialog} from '../detail-dialog';

@Component({
    selector: 'app-device-detail-dialog',
    templateUrl: './device-detail-dialog.component.html',
    styleUrls: ['./device-detail-dialog.component.css']
})
export class DeviceDetailDialogComponent extends DetailDialog<Device, DeviceDetailDialogComponent> {
    plugins: Plugin_Type[];

    constructor(
        fb: FormBuilder,
        @Inject(MAT_DIALOG_DATA) dev: Device,
        dialogRef: MatDialogRef<DeviceDetailDialogComponent>,
        settingsService: SettingsService,
        schemeService: SchemeService,
    ) {
        super(dialogRef, dev, schemeService, Structure_Type.ST_DEVICE, fb);

        settingsService.getPluginTypes().subscribe((plugins) => {
            this.plugins = plugins.results;
        });
    }

    createFormGroup(): FormGroup {
        return this.fb.group({
            id: [null, []],
            name: ['', [Validators.required]],
            plugin_id: [null, []],
            check_interval: [50, [Validators.min(50)]],
            extra: ['', []],
        });
    }

    createItem(formValue: any): Device {
        return {
            ...formValue,
            items: [],
        };
    }
}
