import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SchemeService} from '../../../scheme.service';
import {Structure_Type} from '../../../settings/settings';
import {DetailDialog} from '../detail-dialog';
import {DIG_Type} from '../../../scheme';

@Component({
    selector: 'app-device-item-group-type-detail-dialog',
    templateUrl: './device-item-group-type-detail-dialog.component.html',
    styleUrls: ['./device-item-group-type-detail-dialog.component.css', '../detail-dialog.css']
})
export class DeviceItemGroupTypeDetailDialogComponent extends DetailDialog<DIG_Type, DeviceItemGroupTypeDetailDialogComponent> {
    fg: FormGroup;

    constructor(
        dialogRef: MatDialogRef<DeviceItemGroupTypeDetailDialogComponent>,
        schemeService: SchemeService,
        fb: FormBuilder,
    ) {
        super(dialogRef, null, schemeService, Structure_Type.ST_DIG_TYPE, fb);
    }

    createFormGroup(): FormGroup {
        return this.fb.group({
            id: [null, []],
            name: ['', [Validators.required]],
            title: ['', []],
            description: ['', []],
        });
    }
}
