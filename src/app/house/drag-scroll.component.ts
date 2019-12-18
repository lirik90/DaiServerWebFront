import { Component, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-drag-scroll',
  template: `
    <div #container
      class="projtitle"
      (mousemove)="move($event)"
      (mousedown)="start($event)"
      (mouseup)="end($event)"
      (touchend)="end($event)"
      (touchcancel)="end($event)"
      (touchstart)="onTouchStart($event)"
      (touchmove)="onTouchMove($event)"
    ><ng-content></ng-content></div>`,
  styles: [`
    :host {
      display: grid;
      margin: 0 8px;
    }
    .projtitle {
        height: 100%;
        overflow: hidden;
        
        cursor: ew-resize;
        
        white-space: nowrap;
        line-height: 32px;
        font-size: 21px;
        font-weight: bold;
        font-family: Roboto, "Helvetica Neue", sans-serif;
        color: #999;

        -webkit-touch-callout: none; /* iOS Safari */
        -webkit-user-select: none; /* Safari */
        -khtml-user-select: none; /* Konqueror HTML */
        -moz-user-select: none; /* Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
        user-select: none; /* Non-prefixed version, currently
                                      supported by Chrome and Opera */
    }
    @media all and (max-width: 600px) {
        .projtitle {
            font-size: 18px;
        }
    }
    `]
})
export class DragScrollComponent {

  @ViewChild('container', {static: true}) elem: ElementRef;

  isPressed: boolean = false;
  downX: number = 0;

  start(event: any): void {
    this.isPressed = true;
    this.downX = event.clientX;
  }

  end(event: any): void {
    this.isPressed = false;
  }

  move(event: any) {
    if (!this.isPressed)
      return;

    const el = this.elem.nativeElement;
    el.scrollLeft = el.scrollLeft - event.clientX + this.downX;
    this.downX = event.clientX;
  }

  onTouchStart(event: any): void {
    this.start(event.changedTouches[0]);
  }

  onTouchMove(event: any): void {
    this.move(event.changedTouches[0]);
  }
}
