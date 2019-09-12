import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  ComponentRef, Input,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation
} from '@angular/core';
import {HouseService} from '../../../house/house.service';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';

import * as JsBarcode from 'jsbarcode';

class Element {
  initialX;
  initialY;
  currentX;
  currentY;
  transform;
  initialW;
  initialH;
  currentW;
  currentH;

  bgImg: SafeStyle;
  type: string;
  barcode_type: any;
  value;
  paramName: string;
  fontSize: SafeStyle;
  fontName: SafeStyle;
  fontWeight: SafeStyle;
  scale: number;

  constructor(x = 0, y = 0, w = 32, h = 32) {
    this.initialX = x;
    this.initialY = y;
    this.currentX = x;
    this.currentY = y;

    this.initialW = w;
    this.initialH = h;
    this.currentW = w;
    this.currentH = h;

    this.transform = `translate(${x}px, ${y}px)`;
  }
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
export class LabelComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('previewContainer', { read: ViewContainerRef }) container;
  labjson: any;

  layouts = [
    new Layout()
  ];

  draggingElement: Element;
  resizingElement: Element;

  cont_width: number;
  selectedElement: Element;
  params = [];

  constructor(
    private resolver: ComponentFactoryResolver,
    private houseService: HouseService,
    private renderer2: Renderer2,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    /*
    this.labjson = JSON.parse('{' +
      '  "width": 424,' +
      '  "layouts": [' +
      '    {' +
      '      "elements": [' +
      '        {' +
      '          "x": 0,' +
      '          "y": 0,' +
      '          "w": 354,' +
      '          "param_name": "title",' +
      '          "type": "text",' +
      '      "font": "Monospace",' +
      '      "font_size": 19,' +
      '      "font_bold": true,' +
      '      "align": "left"' +
      '        },' +
      '    {' +
      '      "x": 354,' +
      '      "y": 0,' +
      '      "w": 70,' +
      '      "h": 70,' +
      '      "type": "image",' +
      '      "param_value": "Qk0eCQAAAAAAAD4AAAAoAAAAbgAAAI4AAAABAAEAAAAAAAAAAADEDgAAxA4AAAAAAAAAAAAAAAAAAP///wD/4AAAAAA//Af////8BP8A/+AAAAAAf/wH/////AT/AP/gAAAAAD/8A/////wE/wD/w/Dw+Pw//gP////8BAD//+Px8Pj+P/4B/////AQA///D8fH4/D/+Af////gEP/z/w/Hw+P4//gD////8AEVF/8fh8Ph+P/8A////+AAgAP/D8fH4/h//AH////gAYQD/x+Hw+H4//wB////4AAAA/4fj8Pj+H/8Af///+AAAAP/H4fH4fh//gD////gAAAD/h+Hw+H8f/4A////4AAAA/4fj8Ph+H/+AH///8AAAAP+FQVCoVR//wB////AA/wD/gAAAAAAf/8AP///wAP8A/4AAAAAAD//AD///8AD/AP+AAAAAAB//wA////AAAP//D+Pw/H8P/+AH///wAAD//w/D8fx/D//gB///8AA//P8fw/D8P4//4AP//+AARUX/D8Pw/H8P/+AD///gACAA/x/D8Pw/j//wAf//4ABhAP4fx/H8f4//8AH//+AAAAD/H8Pw/D+H//AB///gAAAA/h/H8Pw/j//wAP//4AAAAP4AAAAAAAf/+AD//+AAAAD+AAAAAAAH//gAf//AAAAA/gAAAAAAB//4AH//wAAAAP4VBVCqFQf/+AA//8AA6gD8P8fw/D/D//wAP//AAP8A/j+H8P4/x//8AD//wAD/APw/h/H+P8f//AAf/4AA/wD8P4fw/j/D//4AH//AAAD//D+P8P4/w//+AA//gAAA//x/h/H+H8P//gAP/4AAP/z8f4/w/j/j//4AB/+AAEVF/FUKoKoVQ///AAf/gAAgAPgAAAAAAAP//wAD/4AAYQD4AAAAAAAB//8AA/8AAAAA+AAAAAAAA///AAP/gAAAAPh/D/H+H+H//4AB/wAAAAD4/w/w/x/h//+AAf8AAAAA8P8P8P4f4f//gAD/AAAAAPj/D/D/H/H//4AA/wAAAADw/x/x/h/h///AAH8AAOoA8P8P8P8f8P//wAB/AAD/APD/H/D/D/H//8AAfgAA/wDx/h/w/h/w///AAD4AAP8A8AAAAAAAAP//4AA+AAAA/+AAAAAAAAD//+AAHgAAAP/wAAAAAAAA///gAB4AAD/84f4f8P8f8P//8AAOAABFReH+H/H/D/j///AADgAAIADh/h/w/w/4f//wAAQAAGEA4/4f8P8P+P//8AAAAAAAAOP+P/H/j/h///gAAAAAAADj/h/w/w/8f//4AAAAAAAAw/4/8P+P+H//+AAAAAAAAMKqFVCqCqh///gAAAAAAADAAAAAAAAAf//8AAAAAAAAwAAAAAAAAH///AAAAADqAMAAAAAAAAA///wAAAAA/wCH/j/w/4f8f//8AAAAAP8Ax/w/8f+P/D///gAAAAD/AIf8P/D/h/w///4AAAAAAP+H/D/w/4/8P//+AAAAAAD/j/w/8P+H/j///wAAAAA//If8f/H/h/w///8AAAAARUWP/D/w/4f+H///AAAAACAAj/h/8P/H/j///wAAAABhAA/8f/D/h/4f//+AAAAAAAAP+H/w/4f+H///gAAAAAAAAAAAAAAAAAP//4AAAAAAAAAAAAAAAAAB//+AAAAAAAAAAAAAAAAAA///wAAAAAAA/////////////8AAAAAAAP/////////////AAAAA6gD//////////////3+//P8A//////////////////z/AP////////////8r+//8/wD/////f///////AASSQAD//////h///////gAAAAAA//////wf//////4AAAAAP/z////4B//////+AAAAAEVF////8Af//////AAAAAAgAP///+AB//////wAAAAAYQD////AAf/////4AAAAAAAA////gAB/////+AAAAAAAAP///wAAf/////gAAAAAAAD///4AAH/////wAAAAAAAA///8AAD/////8AAAAAAAAP///AAB//////AAAAAEAAD///wAA//////gAAAABOoA///4AAf/////4AAAAAz/AP//+AAP/////8AAAAAM/wD///gAH//////AAAAADP8A///4AD//////wAAAABwA////+AB//////4AAAAA8AP////AA//////+AAAAAPD/8///wA///////gAAAADxFRf//4B///////wAAAAB8IAD//8P///////4AAAAAfGEA//+H///////8AAAAAPwAAP//D///////+AAAAAD8AAD//h///////9AAAAAB/AAA//w///////gAAAAAAfwAAP/8f/////4AAAAAAAP8AAD//v////+AAAAAAAAD/AAA///////gAAAAAAAAA/zqAP/////4AAAAAAAAAAf8/wD////+gAAAAAAAAAAP/P8A////wAAAAAAAAAAAD/z/AP///gAAAAAAAAAAAA/8AP////4AAAAAAAAAAAAf/AD////8AAAAAAAAAAAAH/w//P///gAAAAAAAAAAAD/8RUX////tqqqpJEAAAAA//CAA//////////////////xhAP/////////////////8AAD////////////+r////AAA////////////8AP///wAAP///////////8AA///8AAD///////////+AAH///AAA////////////AAA///wAAP///////////gAAH//86gD///////////wAAA///P8A///////////8AAAH//z/AP//////////+AAAB//8/wD///////////gAAAf//AD////////////wAAAH//wA////////////+AAAA//8P/z///////////AAAAP//EVF///////////wAAAD//wgAP//////////+AAAA//8YQD///////////AAAAP//AAA///////////4AAAH//wAAP//////////+AAAB//8AAD///////////gAAAf//AAA///////////8AAAP//wAAP///////////gAAD//8AAD///////////4AAB///OoA",' +
      '      "scale_type": "center"' +
      '        }' +
      '      ]' +
      '    },    ' +
      '    {' +
      '      "elements": [        ' +
      '        {' +
      '      "x": 0,' +
      '      "y": 30,' +
      '      "w": 200,' +
      '      "h": 70,' +
      '      "type": "image",' +
      '      "param_value": "Qk2+CAAAAAAAAD4AAAAoAAAA8gAAAEQAAAABAAEAAAAAAAAAAADEDgAAxA4AAAAAAAAAAAAAAAAAAP///wD//////////////////////wAAAAAAAAAAAAAAAAAA////////////////////////AAAAAAAAAAAAAAAAAAD///////////////////////8AAAAAAAAAAAAAAAAAAP///////////////////////wAAAAAAAAAAAAAAAAAA////////////////////////AAAAAAPgYAAB+AD4AAD///////////////////////8AA//wB/jwf4OcAf4AAP///////////////////////wAB/PgP/Pg+Bw4D/wAA////////////////////////AAD4fB8M+B4PDwfDAAD///////////////////////8AAPg8Hgb8Hg8PB4GAAP///////////////////////wAA+D4+AvQeHgePgIAA////////////////////////AAD4Pj4A5B4eB4+AAAD///////////////////////8AAPgePAAEHh4HjwAAAP///////////////////////wAA+B48AAQeHgePAAAA////////////////////////AAD4HjwABh4eB48AAAD///////////////////////8AAPgePAACHh4HjwAAAP///////////////////////wAA+D48AAIeHgePAAAARf//////////////////////AAD4Pj/+Ah4eB4//gAAA//////////////////////kAAPg+PD4CHh4Hjw+AAAD/////////////////////4AP4+Hw8HgIeHgePB4AAAP/////////////////////Ax/j4/Dw+Ah4eB48HgAAA/////////////////////4BvwP/4HD4CHh4Hjw+AAP//////////////////////gR+A/+AcPAIeDw8HDwAA//////////////////////+DHwD4AB48Ah4PDwePAAD//////////////////////wc/APgADjgHPgcOA44AAP/////8AP//////////////Bz4A+AAHeA//g5wB3gAA//////wA//////////////8HfgD4AAPgAAAB+AD4AAD//////wP//////////////4f+APgEAAAAAAAAAAAAAP//////B///////////////h/kA+AQAAAAAAAAAAAAA//////8H//////////////+G8QD4DAAAAAAAAAAAAAD//////wf//////////////8bxgPgMAAAAAAAAAAAAAP//////B///////////////4OCA+AwAAAAAAAAAAAAA//////8H///////////////w4MD4HAAAAAAAAAAAAABF/////wf///////////////jBwfg8AAAAAAAAAAAAAAD/////BD/hwfg////+D/8H8MPz//wAAAAAAAAAAAAAAP+ADgEAD8DA8B4BAPgD/APw4/P//AAAAAAAAAAAAAAA/8AeAwEHgADgDgGA8OH4AfAgAAAAAAAAAAAAAAAAAAD/8D4PA4eAA8BHB8Hw4fgY4BAAAAAAAAAAAAAAAAAA///wfA8Hg4MHweOHw+Dw8DxgGAAAAAAAAAAAAAAAAAD///B8DwfDg4eB84fD4fDwfmAYAAAAAAAAAAAAAAAAAP//8HwfB8OHh4P7h8PB8GB/YRgAAAAAAAAAAAAAAAAA///wfB8HwYOHg/+Hw8HwYP/hGAAAAAAAAAAAAAAAAAD///B4HwfBg4eD/4fDwfBg/+EYAAAAAAAAAAAAAAAAAP//8Hg/B8HDh4P/h8PB8GD/8DAAAAAAAAAAAAAAAAAA///weD8HwcGHg/+Hw8HwYP/48AAAAAAAAAAAAAAAAAD///B4PwfB8IeD/4ADwfBg//zAAAAAAAAAAAAAAAAAAP//8HB/B8H4B4P/gAPB8GAAfwAAAAAAAAAAAAAAAAAA///wYH8Hwf4Hg/+Hw8HwYAB/AAAAAAAAAAAAAAAAAAD///AA/wfB54eDz4fDwfBg8H8AAAAAAAAAAAAAAAAAAEX/8AH/B8HDh4OHh8PB8GDwfwAAAAAAAAAAAAAAAAAAAP/wA/8Hg4OHg4eHw+HwcPB/AAAAAAAAAAAAAAAAAAAA//Bz/weDg4fDg4fD4fDw8P8AAAAAAAAAAAAAAAAAAAD/8HP/AwODh8OHh8Pg8PDw/wAAAAAAAAAAAAAAAAAAAP/wef4AB8MH4YcDwfDh+GD/AAAAAAAAAAAAAAAAAAD///B5/AAHww/whgEA+EH8If8AAAAAAAAAAAAAAAAAAP//8Hn8BA/wD/gOAQD8B/4D/wAAAAAAAAAAAAAAAAAA///wfP//P/x//j////8f/4//AAAAAAAAAAAAAAAAAAD///B8//////////////////8AAAAAAAAAAAAAAAAAAP//8HzH/////////////////wAAAAAAAAAAAAAAAAAA///wfIf/////////////////AAAAAAAAAAAAAAAAAAD///B+A/////////////////8AAAAAAAAAAAAAAAAAAP//8H4D/////////////////wAAAAAAAAAAAAAAAAAA///gPgP/////////////////AAAAAAAAAAAAAAAAAAD//8APB/////////////////8AAAAAAAAAAAAAAAAAAP//gA8H/////////////////wAAAAAAAAAAAAAAAAAARf///9//////////////////AAAAAAAAAAAAAAAAAAAA//////////////////////8AAAAAAAAAAAAAAAAAAAD//////////////////////wAAAAAAAAAAAAAAAAAAAP//////////////////////AAAAAAAAAAAAAAAAAAAA",' +
      '      "scale_type": "center"' +
      '        },' +
      '        {' +
      '          "x": 200,' +
      '          "y": 0,' +
      '          "w": 224,' +
      '          "h": 130,' +
      '          "param_name": "product_code",' +
      '          "type": "barcode",' +
      '          "barcode_type": 2' +
      '        }' +
      '      ]' +
      '    }' +
      '  ]' +
      '}');
     */
      // TODO: change to `find' later
      const appSection = this.houseService.house.sections[0];
      const tap1Section = this.houseService.house.sections[1];

      const printerGroup = appSection.groups.find(g => g.type.name === 'printer');
      const labelGroup = tap1Section.groups.find(g => g.type.name === 'label');

      this.labjson = JSON.parse(printerGroup.params.find(p => p.param.name === 'label_template' ).value);

      labelGroup.params.map(p => {
        if (p.param.name) {
          this.params.push(p.param.name);
        }
      });

      this.load();
  }

  load() {
    this.cont_width = this.labjson.width;

    this.layouts = [];

    this.labjson.layouts.map(ljson => {
      const l = new Layout();
      this.layouts.push(l);

      ljson.elements.map(ejson => {
        const e = new Element(ejson.x, ejson.y, ejson.w, ejson.h);
        l.elements.push(e);

        e.type = ejson.type;

        //console.log(ejson);

        if (e.type === 'image') {
          const url = `data:image/x-ms-bmp;base64,${ejson.param_value}`;
          e.bgImg = this.sanitizer.bypassSecurityTrustStyle(`url("${url}")`);
        }

        if (e.type === 'barcode') {
          e.barcode_type = ejson.barcode_type;

          const sec = this.houseService.house.sections[1];
          const labelGrp = sec.groups.find(g => g.type.name === 'label');
          const param = labelGrp.params.find(p => p.param.name === ejson.param_name);
          e.value = param.value;
          e.paramName = ejson.param_name;
          e.scale = ejson.scale || 1;
        }

        if (e.type === 'text') {
          // TODO: refactor me
          if (ejson.param_name === 'current_date') {
            e.value = new Date().toLocaleDateString('ru');
            e.paramName = ejson.param_name;
          } else if (ejson.param_name.match(/^manufacturer\./)) {
            const sec = this.houseService.house.sections[1];
            const grp = sec.groups.find(g => g.type.name === 'takeHead' &&
              g.items.find(i => i.type.name === 'takeHead').val.raw === 1);

            //console.log(grp);

            const pn = ejson.param_name.split('.')[1];
            //console.log(pn);


              const param = grp.params.find(p => p.param.name === 'manufacturer').childs.find(c => c.param.name === pn);
              //console.log(param);
              e.value = param.value;
              e.paramName = ejson.param_name;1
          } else {
            const sec = this.houseService.house.sections[1];
            const labelGrp = sec.groups.find(g => g.type.name === 'label');
            const param = labelGrp.params.find(p => p.param.name === ejson.param_name);
            e.value = param.value;
            e.paramName = ejson.param_name;
          }

          if (ejson.pretext) {
            e.value = ejson.pretext + ' ' + e.value;
          }

          e.fontSize = ejson.font_size;
          e.fontName = ejson.font;
          e.fontWeight = ejson.font_bold ? 'bold' : 'normal';
        }
      });
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.adjustLayoutHeights();
      JsBarcode('.jsbarcode').init();
    }, 10);
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

  dragEnd() {
    if (this.draggingElement) {
      this.draggingElement.initialX = this.draggingElement.currentX;
      this.draggingElement.initialY = this.draggingElement.currentY;
      this.draggingElement = null;
    }
    if (this.resizingElement) {
      this.resizingElement.initialW = this.resizingElement.currentW;
      this.resizingElement.initialH = this.resizingElement.currentH;
      this.resizingElement = null;
    }
  }

  movereize($event, el, initialA, initialB, currentA, currentB, currentA2, currentB2) {
    const cont = this.container.element.nativeElement;

    let a = $event.clientX - el[initialA];
    let b = $event.clientY - el[initialB];

    if (a < 0) { a = 0; }
    if (b < 0) { b = 0; }

    if (a + el[currentA2] > cont.clientWidth) {
      a = cont.clientWidth - el[currentA2];
    }
    if (b + el[currentB2] > cont.clientHeight) {
      b = cont.clientHeight - el[currentB2];
    }

    // snap to grid
    a -= a % 10;
    b -= b % 10;

    el[currentA] = a;
    el[currentB] = b;
  }

  drag($event: MouseEvent) {
    if (this.draggingElement) {
      this.movereize($event, this.draggingElement,
        'initialX', 'initialY',
        'currentX', 'currentY',
        'currentW', 'currentH');

      this.draggingElement.transform = 'translate(' + this.draggingElement.currentX + 'px, ' + this.draggingElement.currentY + 'px)';
    }
    if (this.resizingElement) {
      this.movereize($event, this.resizingElement,
        'initialW', 'initialH',
        'currentW', 'currentH',
        'currentX', 'currentY');
    }
  }

  resizeStart(e: Element, $event: MouseEvent) {
    $event.preventDefault();
    $event.stopPropagation();

    e.initialW = $event.clientX - e.currentW;
    e.initialH = $event.clientY - e.currentH;

    this.resizingElement = e;
  }

  private adjustLayoutHeights() {
    this.layouts.map((l, li) => {
      let h = 0;
      l.elements.map((e, ei) => {
        if (e.type === 'text') {
          // update height
          const natEl = document.getElementById(`element-${li}-${ei}`);
          console.log(`element-${li}-${ei}`);
          e.currentH = natEl.getBoundingClientRect().height;
          console.log(e.currentH);
        }

        if (e.currentY + e.currentH > h) {
          h = e.currentY + e.currentH;
        }
      });

      l.height = h;
    });
  }

  getBarcodeType(barcode_type) {
    switch (barcode_type) {
      case 1:
        return 'EAN13';
      case 2:
        return 'CODE128';
      case 3:
        return 'QR';
    }
  }

  select(e: Element) {
    this.selectedElement = e;
  }
}
