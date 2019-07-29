import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthenticationService} from '../authentication.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate, CanActivateChild {
  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  hasPermission(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const req_perms = route.data.req_perms as Array<string>;

    if (req_perms === undefined) {
      // allow if no permissions are required
      return true;
    }

    const userPerms = {
      'can_see_more': this.authService.canChangeHouse(),
      'can_edit': this.authService.canChangeItemState(),
      'can_wash': this.authService.canAddDeviceItem()
    };

    const allow = req_perms.map((perm) => userPerms[perm]).reduceRight((a, b) => a && b);

    if (!allow) {
      // navigate to details in case of access denied
      console.log(route);

      const curName = route.parent.params.name;
      this.router.navigate(['/house', curName, 'detail' ]);
    }

    return allow;
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.hasPermission(next, state);
  }
  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.hasPermission(next, state);
  }

}
