import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'
import { catchError, tap, finalize } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

import { User } from "./user";

@Injectable()
export class AuthenticationService {

  currentUser: User;
  timeout_handle: any;

  private tokenUrl = '/api/token/';

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

  isKegReplacer(): boolean {
    return this.checkPermission('toggle_deviceitem');
  }

  canChangeParam(): boolean {
    return this.checkPermission('change_paramvalue');
  }

  isSupervisor(): boolean {
    return this.checkPermission('change_house');
  }

  isCleaner(): boolean {
    return this.checkPermission('add_deviceitem');
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
            this.goToLogin();
            return of();
          })
        ).subscribe(() => this.refreshToken());
      }, 14.7 * 60000);
    }
    return user;
  }

  refreshToken(user: any = undefined): void {
    if (!user)
      user = this.currentUser;
    if (user && user.token) {
      this.http.post<any>(this.tokenUrl + 'refresh/', { token: user.token }).pipe(
        catchError(error => {
          this.goToLogin();
          return of();
        })
      ).subscribe(refreshed_user => this.setCurrentUser(refreshed_user));
    }
  }

  goToLogin(): void {
    const url = document.location.href.toString().split(document.location.host)[1];
    this.router.navigate(['/login'], { queryParams: { returnUrl: url }});
  }

  login(username: string, password: string) {
    return this.http.post<any>(this.tokenUrl + 'auth/', { username: username, password: password })
        .map(user => { return this.setCurrentUser(user); });
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
