import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from "@angular/common";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import 'rxjs/add/operator/map';
import { catchError} from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

import { User } from './user';

@Injectable()
export class AuthenticationService {

  private currentUser_: User;
  timeout_handle: any;

  private tokenUrl = '/api/token/';

  get currentUser() {
    return this.currentUser_;
  }

  set currentUser(usr) {
    //console.log('!!!!!!!!!!!!');
    this.currentUser_ = usr;
  }

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(DOCUMENT) document: any
  ) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  isAdmin(): boolean {
    return this.checkPermission('change_logentry');
  }

  isFullAccess(): boolean {
    return this.checkPermission('add_logentry');
  }

  canChangeParam(): boolean {
    return this.checkPermission('change_dig_param_value');
  }

  checkPermission(item: string): boolean {
    if (!this.currentUser || !this.currentUser.permissions) {
      return false;
    }

    return this.currentUser.permissions.indexOf(item) > -1;
  }

  getCsrf(): void {
    this.http.head<any>('/get_csrf').pipe(
      catchError(error => {
        console.log('1');
        this.goToLogin();
        return of();
      })
    ).subscribe(() => this.refreshToken());
  }

  private setCurrentUser(user: any): User {
    // login successful if there's a jwt token in the response
    if (user && user.token) {
      // store user details and jwt token in local storage to keep user logged in between page refreshes
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUser = user;

      clearTimeout(this.timeout_handle);
      this.timeout_handle = setTimeout(() => {
        this.http.head<any>('/get_csrf').pipe(
          catchError(error => {
            console.log('2');
            this.goToLogin();
            return of();
          })
        ).subscribe(() => this.refreshToken());
      }, 14.7 * 60000);
    }
    return user;
  }

  refreshToken(user: any = undefined): void {
    if (!user) {
      user = this.currentUser;
    }
    if (user && user.token) {
      this.http.post<any>(this.tokenUrl + 'refresh/', { token: user.token }).pipe(
        catchError(error => {
          console.log('3');
          this.goToLogin();
          return of();
        })
      ).subscribe(
        refreshed_user => {
          this.setCurrentUser(refreshed_user);
          if (refreshed_user.need_to_change_password === true) {
            this.router.navigate(['/user/details']);
          }
        }
      );
    }
  }

  goToLogin(): void {
    const url = document.location.href.toString().split(document.location.host)[1];
    this.router.navigate(['/login'], { queryParams: { returnUrl: url }});
  }

  login(username: string, password: string) {
    return this.http.post<any>(this.tokenUrl + 'auth/', { username: username, password: password })
        .map(user => this.setCurrentUser(user));
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    if (this.currentUser) {
      this.currentUser = undefined;
      clearTimeout(this.timeout_handle);
    }
  }

  createUser(user: any) {
    return this.http.post('/api/v1/users/', user);
  }
}
