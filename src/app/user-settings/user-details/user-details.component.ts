import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from '../../authentication.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {IHouseService} from '../../ihouse.service';
import {catchError, tap} from 'rxjs/operators';
import {of} from 'rxjs';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';

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

  constructor(
    public authService: AuthenticationService,
    private formBuilder: FormBuilder,
    protected http: HttpClient,
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
      this.http.put('/api/v1/change_password/', pwd, httpOptions).subscribe(res => {
        console.log(res);
      }, error => {
        console.log(error);
        console.log(this.authService.currentUser);
      });
    }
  }
}
