import {Component, Inject} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Device, Plugin_Type} from '../../scheme';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {SettingsService} from '../../settings.service';
import {SchemeService} from '../../scheme.service';
import {Structure_Type} from '../../settings/settings';
import {DetailDialog} from '../detail-dialog';
import {PluginDetailDialogComponent} from '../plugin-detail-dialog/plugin-detail-dialog.component';

@Component({
    selector: 'app-device-detail-dialog',
    templateUrl: './device-detail-dialog.component.html',
    styleUrls: ['./device-detail-dialog.component.css', '../detail-dialog.css']
})
export class DeviceDetailDialogComponent extends DetailDialog<Device, DeviceDetailDialogComponent> {
    plugins: Plugin_Type[];

    constructor(
        fb: FormBuilder,
        @Inject(MAT_DIALOG_DATA) dev: Device,
        dialogRef: MatDialogRef<DeviceDetailDialogComponent>,
        private dialog: MatDialog,
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
            plugin_id: [0, []],
            check_interval: [50, [Validators.min(50)]],
            extra: ['', []],
        });
    }

    patchValue(dialogData) {
        if (dialogData) {
            this.fg.patchValue({
                ...dialogData,
                plugin_id: dialogData.plugin_id || 0, // if plugin_id === null, set it to 0
            });
        }
    }

    createItem(formValue: any): Device {
        return {
            ...formValue,
            items: [],
        };
    }

    newPlugin() {
        this.dialog.open(PluginDetailDialogComponent, { width: '80%' })
            .afterClosed()
            .subscribe((pluginType: Plugin_Type) => {
                this.plugins.push(pluginType);
            });
    }
}
