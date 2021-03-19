import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Modify_Structure_Type, Patch_Structure_Response, SchemeService} from '../scheme.service';
import {Structure_Type} from '../settings/settings';

export abstract class DetailDialog<T extends Modify_Structure_Type,C> {
    public fg: FormGroup;

    protected constructor(
        protected dialogRef: MatDialogRef<C>,
        protected dialogData: T,
        protected schemeService: SchemeService,
        protected settingName: Structure_Type,
        protected fb: FormBuilder,
    ) {
        this.fg = this.createFormGroup();

        this.patchValue(dialogData);
    }

    patchValue(dialogData) {
        if (dialogData) {
            this.fg.patchValue(dialogData);
        }
    }

    submit() {
        if (this.fg.invalid) return;

        let prev = this.dialogData?.id ? this.dialogData : null;
        this.schemeService.upsert_structure(
            this.settingName,
            this.createItem(this.fg.value),
            prev,
        )
            .subscribe((r: Patch_Structure_Response<T>) => {
                this.dialogRef.close({
                    ...this.fg.value,
                    id: prev?.id || r.inserted[0].id,
                });
            });
    }

    cancel() {
        this.dialogRef.close(null);
    }

    abstract createFormGroup(): FormGroup;

    createItem(formValue: any): T {
        return {...formValue};
    }
}
