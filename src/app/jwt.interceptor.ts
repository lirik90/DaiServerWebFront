import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { throwError } from 'rxjs';
import 'rxjs/add/operator/catch';

import { AuthenticationService } from "./authentication.service";
 
@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthenticationService,
    private router: Router 
  ) {}

  private setTokenHeader(request: HttpRequest<any>, user: any): HttpRequest<any> {
    if (user && user.token)
      return request.clone({
        setHeaders: {
          Authorization: `JWT ${user.token}`
        }
      });
    return null;  
  }
	
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // add authorization header with jwt token if available
    // let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const authReq = this.setTokenHeader(request, this.authService.currentUser);
    if (authReq) {
      request = authReq;
    }
 
    return next.handle(request)
      .catch((error, caught) => {
        //if (error.status === 400)
        //  this.authService.goToLogin();

        if (error.status === 401) {
          // logout users, redirect to login page
          // this.authService.logout(); // Logout automaticaly on /login page
          this.authService.goToLogin();
          return throwError(error);
        }

        /*if (error.status === 419) {
          return this.authService.refreshToken().flatMap(t => {
            const authReq = this.setTokenHeader(request, t);
	    if (authReq) {
              return next.handle(authReq);
	    }
          });
        }*/

        //return all others errors 
        return throwError(error);
      }) as any;
  }
}
