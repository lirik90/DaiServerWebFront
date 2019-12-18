import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Router, UrlTree, UrlSegmentGroup, PRIMARY_OUTLET } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { HouseService } from './house.service';
import { AuthenticationService } from '../authentication.service';

@Injectable()
export class ProjectLoadGuard implements CanActivate, CanActivateChild {

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private projService: HouseService
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.projService.house) {
      return true;
    }

    const name = next.paramMap.get('name');
    return this.projService.loadHouse2(name);
  }

  canActivateChild(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (next.data['is_edit'] && !this.authService.isKegReplacer()) {
      const tree: UrlTree = this.router.parseUrl(state.url);
      const g: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
      const segments: any[] = [g.segments[0].path, g.segments[1].path, 'detail'];
      this.router.navigate(segments);
      return false;
    }

    // const id = +next.paramMap.get('id');
    // console.log(`load guard start child: ${state.url} proj_id: ${id}`);
    return true;
/*
    return Observable.timer(5000).map(() => {
      console.log('load guard timeout');
      return true;
    });*/

//    return this.canActivate(route, state);
  }
}
