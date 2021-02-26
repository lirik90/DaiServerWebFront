import {Component, Inject} from '@angular/core';
import {Section} from '../../scheme';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SchemeService} from '../../scheme.service';
import {Structure_Type} from '../../settings/settings';

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
        private schemeService: SchemeService,
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
            + (parseInt(minutes, 10) || 0) * 60
            + parseInt(seconds, 10) || 0;
    }

    submitForm() {
        if (this.fg.invalid) return;

        const section: Section = {
            ...this.fg.value,
            day_start: this.convertTimeStringToSeconds(this.fg.value.day_start),
            day_end: this.convertTimeStringToSeconds(this.fg.value.day_end),
            groups: [],
        };

        this.schemeService.upsert_structure(Structure_Type.ST_SECTION, section)
            .subscribe(() => this.dialogRef.close(section));
    }

    cancel() {
        this.dialogRef.close(null);
    }
}
