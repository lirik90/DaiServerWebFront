import {Component, Inject} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Device_Item_Type, DIG_Type, Register_Type, Save_Algorithm, Save_Timer, Sign_Type} from '../../scheme';
import {SchemeService} from '../../scheme.service';
import {DeviceItemGroupTypeDetailDialogComponent} from '../device-item-group-type-detail-dialog/device-item-group-type-detail-dialog.component';
import {SignTypeDetailDialogComponent} from '../sign-type-detail-dialog/sign-type-detail-dialog.component';
import {SettingsService} from '../../settings.service';
import {Structure_Type} from '../../settings/settings';

@Component({
    selector: 'app-device-item-type-detail-dialog',
    templateUrl: './device-item-type-detail-dialog.component.html',
    styleUrls: ['./device-item-type-detail-dialog.component.css']
})
export class DeviceItemTypeDetailDialogComponent {
    fg: FormGroup;
    signTypes: Sign_Type[];
    registerTypes = this.enumToArray(Register_Type);
    saveAlgos = this.enumToArray(Save_Algorithm);
    saveTimers: Save_Timer[];
    Save_Algorithm = Save_Algorithm;
    groupTypes: DIG_Type[];

    constructor(
        fb: FormBuilder,
        private dialogRef: MatDialogRef<DeviceItemTypeDetailDialogComponent>,
        private dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) private data: Device_Item_Type,
        private schemeService: SchemeService,
        private settings: SettingsService,
    ) {
        this.fg = fb.group({
            id: [null, []],
            name: ['', []],
            title: ['', []],
            group_type_id: [null, [Validators.required]],
            sign_id: [null, [Validators.required]],
            register_type: [null, [Validators.required]],
            save_algorithm: [null, [Validators.required]],
            save_timer_id: [null, []],
        });

        this.signTypes = this.schemeService.scheme.sign_type;
        this.groupTypes = this.schemeService.scheme.dig_type;
        this.settings.getSaveTimers().subscribe(timers => this.saveTimers = timers.results);

        this.fg.controls.save_algorithm.valueChanges.subscribe((v) => {
            const control = this.fg.controls.save_timer_id;
            if (
                v === Save_Algorithm.SA_BY_TIMER
                || v === Save_Algorithm.SA_BY_TIMER_ANY_CASE
            ) {
                control.setValidators([Validators.required]);
            } else {
                control.clearValidators();
            }
        });
    }

    submit() {
        if (this.fg.invalid) return;
        this.schemeService.upsert_structure(Structure_Type.ST_DEVICE_ITEM_TYPE, { ...this.fg.value })
            .subscribe(() => {
                this.dialogRef.close(this.fg.value);
            });
    }

    cancel() {
        this.dialogRef.close(null);
    }

    enumToArray(en: any) {
        return Object.keys(en)
            .filter(key => key.length > 2) // filter out numbers
            .map(key => ({ id: en[key], name: key }));
    }

    newGroupType() {
        this.dialog.open(DeviceItemGroupTypeDetailDialogComponent, { width: '80%' })
            .afterClosed()
            .subscribe((type?: DIG_Type) => {
                if (!type) return;

                // TODO: update list if needed
            });
    }

    newSignType() {
        this.dialog.open(SignTypeDetailDialogComponent, { width: '80%' })
            .afterClosed()
            .subscribe((signType?: Sign_Type) => {
                if (!signType) return;

                // TODO: update list if needed
            });
    }
}
