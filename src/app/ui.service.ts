import { Injectable } from '@angular/core';

@Injectable()
export class UIService {

  scrollTop_ = 0;

  constructor() { }

  get scrollTop(): number {
    return this.scrollTop_;
  }

  onScroll($event) {
    this.scrollTop_ = $event.target.scrollTop;
  }

  isToolbarHidden(): boolean {
    return this.scrollTop > 48; // TODO: Toolbar has different height on different window.width's
  }
}
