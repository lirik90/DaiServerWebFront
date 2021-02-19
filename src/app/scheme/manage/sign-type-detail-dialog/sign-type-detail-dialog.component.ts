import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SchemeService} from '../../scheme.service';

@Component({
    selector: 'app-sign-type-detail-dialog',
    templateUrl: './sign-type-detail-dialog.component.html',
    styleUrls: ['./sign-type-detail-dialog.component.css']
})
export class SignTypeDetailDialogComponent {
    fg: FormGroup;

    constructor(
        private dialogRef: MatDialogRef<SignTypeDetailDialogComponent>,
        private schemeService: SchemeService,
        fb: FormBuilder,
    ) {
        this.fg = fb.group({
            id: [null, []],
            name: ['', [Validators.required]],
        });
    }

    submit() {
        if (this.fg.invalid) return;

        this.schemeService.modify_structure('sign_type', [{ ...this.fg.value }])
            .subscribe(() => {
                this.dialogRef.close(this.fg.value);
            });
    }

    cancel() {
        this.dialogRef.close(null);
    }

}
