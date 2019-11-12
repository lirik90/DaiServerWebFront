import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from '../../authentication.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {IHouseService} from '../../ihouse.service';
import {catchError, tap} from 'rxjs/operators';
import {of} from 'rxjs';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {TranslateService} from '@ngx-translate/core';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent implements OnInit {
  currentUser: any;

  changePasswordGroup: FormGroup;
  newPassErrors = [];
  oldPassErrors = [];
  success = false;
  success2 = false;

  constructor(
    public authService: AuthenticationService,
    private formBuilder: FormBuilder,
    protected http: HttpClient,
    public translate: TranslateService,
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.currentUser;

    this.changePasswordGroup = this.formBuilder.group({
      cur_password: ['', Validators.required],
      new_password: ['', Validators.required],
      confirm_password: ['', Validators.required],
    }, {validator: this.confirmValidator});
  }

  confirmValidator(group: FormGroup) {
    // tslint:disable-next-line:triple-equals
    if (group.controls['new_password'].value == group.controls['confirm_password'].value) {
      return null;
    }

    return {
      mismatch: true
    };
  }

  changePassword() {
    if (this.changePasswordGroup.invalid) {
    } else {
      const pwd = {
        'old_password': this.changePasswordGroup.value.cur_password,
        'new_password':  this.changePasswordGroup.value.new_password
      };

      this.newPassErrors = [];
      this.oldPassErrors = [];

      this.http.put('/api/v1/change_password/', pwd, httpOptions).subscribe(resp => {
        if (typeof resp === 'object' && resp !== null && 'new_password' in resp) {
          // show new password errors
          this.newPassErrors = (resp['new_password'] as string[]).map(e => this.translate.instant(e));
        }

        if (typeof resp === 'object' && resp !== null && 'old_password' in resp) {
          // show old password errors
          this.oldPassErrors = (resp['old_password'] as string[]).map(e => this.translate.instant(e));
        }

        console.log(resp);
        // tslint:disable-next-line:triple-equals
        if (resp == 'New password is the same of old_password') {
          this.newPassErrors.push(this.translate.instant('New password is the same of old_password'));
        }

        // tslint:disable-next-line:triple-equals
        if (resp == 'Success.') {
          // show success messge
          console.log('TRYU!!!');
          this.success = true;
          const i = setInterval(() => {
            this.success = false;
          }, 2000);
        }
      }, error => {
        console.log(error);
      });
    }
  }
}