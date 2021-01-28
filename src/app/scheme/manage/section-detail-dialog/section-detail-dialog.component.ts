import {Component, Inject} from '@angular/core';
import {Section} from '../../scheme';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

export type Section_Details = Pick<Section, "name" | "day_start" | "day_end">

@Component({
    selector: 'app-section-detail-dialog',
    templateUrl: './section-detail-dialog.component.html',
    styleUrls: ['./section-detail-dialog.component.css'],
})
export class SectionDetailDialogComponent {
    fg: FormGroup;

    constructor(
        @Inject(MAT_DIALOG_DATA) private section: Section,
        private dialogRef: MatDialogRef<SectionDetailDialogComponent>,
        fb: FormBuilder,
    ) {
        this.fg = fb.group({
            id: [null, []],
            name: ['', [Validators.required]],
            day_start: [null, [Validators.required]],
            day_end: [null, [Validators.required]],
        });

        if (this.section) {
            this.fg.patchValue({
                ...this.section,
                day_start: this.convertSecondsToStringTime(this.section.day_start),
                day_end: this.convertSecondsToStringTime(this.section.day_end),
            });
        }
    }

    private convertSecondsToStringTime(seconds: number): string {
        const pad = (v: number): string => v < 10 ? `0${v}` : v.toString();
        const d = new Date(seconds * 1000);

        return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
    }

    private convertTimeStringToSeconds(str: string): number {
        const [hours, minutes, seconds] = str.split(':');
        return parseInt(hours, 10) * 3600
            + parseInt(minutes, 10) * 60
            + parseInt(seconds);
    }

    submitForm() {
        if (this.fg.invalid) return;

        const section: Section = {
            ...this.fg.value,
            day_start: this.convertTimeStringToSeconds(this.fg.value.day_start),
            day_end: this.convertTimeStringToSeconds(this.fg.value.day_end),
        };

        this.dialogRef.close(section);
    }

    cancel() {
        this.dialogRef.close(null);
    }
}
