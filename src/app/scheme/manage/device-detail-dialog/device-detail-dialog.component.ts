import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Device, Plugin_Type} from '../../scheme';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {SettingsService} from '../../settings.service';
import {SchemeService} from '../../scheme.service';
import {Structure_Type} from '../../settings/settings';

@Component({
    selector: 'app-device-detail-dialog',
    templateUrl: './device-detail-dialog.component.html',
    styleUrls: ['./device-detail-dialog.component.css']
})
export class DeviceDetailDialogComponent implements OnInit {
    fg: FormGroup;
    plugins: Plugin_Type[];

    constructor(
        fb: FormBuilder,
        @Inject(MAT_DIALOG_DATA) private dev: Device,
        private dialogRef: MatDialogRef<DeviceDetailDialogComponent>,
        private settingsService: SettingsService,
        private schemeService: SchemeService,
    ) {
        this.fg = fb.group({
            id: [null, []],
            name: ['', [Validators.required]],
            plugin_id: [null, []],
            check_interval: [50, [Validators.min(50)]],
            extra: ['', []],
        });

        settingsService.getPluginTypes().subscribe((plugins) => {
            this.plugins = plugins.results;
        });

        if (this.dev) {
            this.fg.patchValue(this.dev);
        }
    }

    ngOnInit(): void {
    }

    submit() {
        if (this.fg.invalid) return;
        const device: Device = {
            ...this.fg.value,
            items: [],
        };

        this.schemeService.upsert_structure(Structure_Type.ST_DEVICE, device)
            .subscribe((data) => {
                this.dialogRef.close(this.fg.value);
            });
    }

    cancel() {
        this.dialogRef.close(null);
    }
}
