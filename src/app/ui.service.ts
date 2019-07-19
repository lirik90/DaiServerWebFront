import { Injectable } from '@angular/core';

@Injectable()
export class UIService {

  scrollTop_ = 0;
  toolBarHidden_ = false;

  constructor() { }

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
}
