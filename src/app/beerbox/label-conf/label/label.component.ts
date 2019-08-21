import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation
} from '@angular/core';
import {HouseService} from '../../../house/house.service';

class Element {
  initialX;
  initialY;
  currentX = 0;
  currentY = 0;
  transform = `translate(${this.currentX}px, ${this.currentY}px)`;
  initialW = 0;
  initialH = 0;
  currentW = 32;
  currentH = 32;
}

class Layout {
  height = 0;
  elements: Element[] = [];
}

@Component({
  selector: 'app-label',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class LabelComponent implements OnInit, OnDestroy {

  @ViewChild('previewContainer', { read: ViewContainerRef }) container;
  labjson: any;

  layouts = [
    new Layout()
  ];

  draggingElement: Element;
  resizingElement: Element;

  constructor(
    private resolver: ComponentFactoryResolver,
    private houseService: HouseService,
    private renderer2: Renderer2
  ) { }

  ngOnInit() {
    /*
    const grps = this.houseService.house.sections[1].groups;

    const grp: Group = grps.filter((value) => value.type.name === 'label')[0];

    this.labjson = grp.params;

    this.renderPreview(this.layout);
    */
  }

  ngOnDestroy() { }

  addLayout() {
    this.layouts.push(new Layout());
  }

  addElement(l: Layout) {
    l.elements.push(new Element());
  }

  /*
  private renderPreview(layout: any) {
    for (const key in layout) {
      if (!layout.hasOwnProperty(key)) {
        continue;
      }

      this.createComponent(layout[key]);
    }

  }

  private createComponent(el: any) {
    const components = {
      text: LabelElementTextComponent
    };

    const comp = components[el.type];
    if (comp === undefined) {
      return;
    }

    const factory = this.resolver.resolveComponentFactory(comp);

    const compRef = this.container.createComponent(factory);
    this.renderer2.addClass(compRef.location.nativeElement, 'label-element');

    switch (el.type) {
      case 'text':
        if (el.paramName) {
          compRef.instance.text = this.labjson.filter((value) => value.param.name === el.paramName)[0].value;
        }
        break;
    }
  }
*/

  dragStart(e: Element, $event: MouseEvent) {
    $event.preventDefault();

    e.initialX = $event.clientX - e.currentX;
    e.initialY = $event.clientY - e.currentY;

    this.draggingElement = e;
  }

  dragEnd(e: Element) {
    e.initialX = e.currentX;
    e.initialY = e.currentY;

   this.draggingElement = null;
  }

  drag($event: MouseEvent) {
    if (this.draggingElement) {
      this.draggingElement.currentX = $event.clientX - this.draggingElement.initialX;
      this.draggingElement.currentY = $event.clientY - this.draggingElement.initialY;

      this.draggingElement.transform = 'translate(' + this.draggingElement.currentX + 'px, ' + this.draggingElement.currentY + 'px)';
    }

    if (this.resizingElement) {
      this.resizingElement.currentW = $event.clientX - this.resizingElement.initialW;
      this.resizingElement.currentH = $event.clientY - this.resizingElement.initialH;
    }
  }

  resizeStart(e: Element, $event: MouseEvent) {
    $event.preventDefault();
    $event.stopPropagation();

    e.initialW = $event.clientX - e.currentW;
    e.initialH = $event.clientY - e.currentH;

    this.resizingElement = e;
  }

  resizeEnd(e: Element) {
    e.initialX = e.currentX;
    e.initialY = e.currentY;

    this.resizingElement = null;
  }
}
