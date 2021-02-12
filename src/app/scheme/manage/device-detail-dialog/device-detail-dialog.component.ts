import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Device, Plugin_Type} from '../../scheme';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

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
    ) {
        this.fg = fb.group({
            name: ['', [Validators.required]],
            plugin_id: [null, []],
            check_interval: [50, [Validators.min(50)]],
            extra: ['', []],
        });

        // settingsService.getPluginTypes().subscribe((plugins) => {
        //     this.plugins = plugins.results;
        // });
        // TODO: fetch plugin types when adding requests for other data (task 22, 23, 25) waiting for MR#40

        if (this.dev) {
            this.fg.patchValue(this.dev);
        }
    }

    ngOnInit(): void {
    }

    submit() {
        if (this.fg.invalid) return;

        this.dialogRef.close(this.fg.value);
    }

    cancel() {
        this.dialogRef.close(null);
    }
}
