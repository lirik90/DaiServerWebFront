import { Component, OnInit, Inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormGroupDirective, NgForm, Validators, ValidatorFn, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ISubscription } from "rxjs/Subscription";
import { Observable } from 'rxjs/Observable';
import { catchError, switchMap, map, delay } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

import { Scheme } from '../../../user';
import { SchemesService } from '../../schemes.service';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        const isSubmitted = form && form.submitted;
        return !!(control && (control.invalid || control.pending) && (control.dirty || control.touched || isSubmitted));
    }
}

export function forbidden_name_validator(nameRe: RegExp): ValidatorFn
{
    return (control: AbstractControl): {[key: string]: any} | null => {
        const is_valid = nameRe.test(control.value);
        return is_valid ? null : {'forbiddenName': {value: control.value}};
    };
}

export function unique_scheme_name_validator(schemesService: SchemesService): AsyncValidatorFn
{
    return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> =>
    {
        return of(null).pipe(
            delay(300),
            switchMap(val => {
                return schemesService.getScheme(control.value).pipe(
                    map(scheme => scheme ? { uniqueName: true } : null),
                    catchError(() => of(null))
                );
            })
        );
    };
}

@Component({
  selector: 'app-create-scheme-dialog',
  templateUrl: './create-scheme-dialog.html',
  styleUrls: [ './create-scheme-dialog.css']
})
export class Create_Scheme_Dialog implements OnInit {
    fc_name = new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        forbidden_name_validator(/^[a-zA-Z][a-zA-Z0-9\_]+$/)
    ], unique_scheme_name_validator(this.schemesService));

    fc_title = new FormControl('');
    fc_address = new FormControl('');
    fc_cities = new FormControl(null);
    fc_comp = new FormControl(null);
    fc_desc = new FormControl('');
    fc_parent = new FormControl(null);

    form = new FormGroup({
        name: this.fc_name,
        title: this.fc_title,
        address: this.fc_address,
        city_id: this.fc_cities,
        company_id: this.fc_comp,
        description: this.fc_desc,
        parent_id: this.fc_parent
    });

    matcher = new MyErrorStateMatcher();

    cities: any[];
    comps: any[];
    schemes: any[] = [];
  
    is_title_gen: boolean;

    constructor(
        private schemesService: SchemesService,
        public dialogRef: MatDialogRef<Create_Scheme_Dialog>,
        @Inject(MAT_DIALOG_DATA) public data: any)
    {
        this.cities = data.cities;
        this.comps = data.comps;
    }
  
    ngOnInit(): void
    {
        this.is_title_gen = true;
        this.schemesService.get_parent_schemes().subscribe(schemes => this.schemes = schemes);
    }

    onNoClick(): void
    {
        this.dialogRef.close();
    }

    create(): void
    {
        this.dialogRef.close(this.form.value);
    }

    name_change(): void
    {
        if (this.is_title_gen)
            this.fc_title.setValue(this.fc_name.value);
    }

    title_change(): void
    {
        this.is_title_gen = this.fc_title.value.length === 0;
        this.name_change();
    }
}

