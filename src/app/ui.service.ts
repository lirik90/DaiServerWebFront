import { Injectable } from '@angular/core';
import {BreakpointObserver, BreakpointState} from '@angular/cdk/layout';
import {Observable} from 'rxjs';

@Injectable()
export class UIService {

  scrollTop_ = 0;
  toolBarHidden_ = false;

  constructor(
    public breakpointObserver: BreakpointObserver
  ) { }

  get scrollTop(): number {
    return this.scrollTop_;
  }

  onScroll($event) {
    this.scrollTop_ = $event.target.scrollTop;
  }

  isToolbarHidden(): boolean {
    if(this.scrollTop > 48 ) {
      this.toolBarHidden_ = true;
    }

    if(this.scrollTop === 0) {
      this.toolBarHidden_ = false;
    }

    return this.toolBarHidden_; // TODO: Toolbar has different height on different window.width's
  }

  mobileBreakpointObserver(): Observable<BreakpointState> {
    return this.breakpointObserver
      .observe(['(min-width: 600px)'])
  }
}
