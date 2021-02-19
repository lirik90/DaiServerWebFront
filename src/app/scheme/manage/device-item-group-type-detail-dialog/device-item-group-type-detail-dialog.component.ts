import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SchemeService} from '../../scheme.service';

@Component({
    selector: 'app-device-item-group-type-detail-dialog',
    templateUrl: './device-item-group-type-detail-dialog.component.html',
    styleUrls: ['./device-item-group-type-detail-dialog.component.css']
})
export class DeviceItemGroupTypeDetailDialogComponent {
    fg: FormGroup;

    constructor(
        private dialogRef: MatDialogRef<DeviceItemGroupTypeDetailDialogComponent>,
        private schemeService: SchemeService,
        fb: FormBuilder,
    ) {
        this.fg = fb.group({
            id: [null, []],
            name: ['', [Validators.required]],
            title: ['', []],
            description: ['', []],
        });
    }

    submit() {
        if (this.fg.invalid) return;

        this.schemeService.modify_structure('group', [{ ...this.fg.value }])
            .subscribe(() => {
                this.dialogRef.close(this.fg.value);
            });
    }

    cancel() {
        this.dialogRef.close(null);
    }
}
