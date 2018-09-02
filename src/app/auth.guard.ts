import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot,
         CanActivateChild, NavigationExtras, CanLoad, Route } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { AuthenticationService } from "./authentication.service";

@Injectable()
export class AuthGuard implements CanActivate, CanLoad {

  constructor(
    private router: Router, 
    private authService: AuthenticationService,
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean 
  {
    return this.checkLogin();
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivate(route, state);
  }

  canLoad(route: Route): boolean {
    return this.checkLogin();
  }

  checkLogin(): boolean {
    if (localStorage.getItem('currentUser')) {
      // logged in so return true
      return true;
    }

    // not logged in so redirect to login page with the return url
    this.authService.goToLogin();
//    this.router.navigate(['./child-two'], {relativeTo: this.route});
    return false;
/*

   if (this.authService.isLoggedIn) { return true; }

    // Store the attempted URL for redirecting
    this.authService.redirectUrl = url;

    // Create a dummy session id
    let sessionId = 123456789;

    // Set our navigation extras object
    // that contains our global query params and fragment
    let navigationExtras: NavigationExtras = {
      queryParams: { 'session_id': sessionId },
      fragment: 'anchor'
    };

    // Navigate to the login page with extras
    this.router.navigate(['/login'], navigationExtras);
    return false;*/
  }
}
