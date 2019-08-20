import {Component, ComponentFactoryResolver, ComponentRef, OnDestroy, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {LabelElementTextComponent} from './label-element-text/label-element-text.component';
import {HouseService} from '../../../house/house.service';
import {Group} from '../../../house/house';

@Component({
  selector: 'app-label',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.css']
})
export class LabelComponent implements OnInit, OnDestroy {
  private layout = {
    title: {
      type: 'text',
      paramName: 'title'
    },
    storCond: {
      type: 'text',
      paramName: 'storage_conditions'
    }
  };

  @ViewChild('previewContainer', { read: ViewContainerRef }) container;
  labjson: any;

  constructor(
    private resolver: ComponentFactoryResolver,
    private houseService: HouseService,
  ) { }

  ngOnInit() {
    const grps = this.houseService.house.sections[1].groups;

    const grp: Group = grps.filter((value) => value.type.name === 'label')[0];

    this.labjson = grp.params;

    this.renderPreview(this.layout);
  }

  ngOnDestroy() { }

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

    const componentRef = this.container.createComponent(factory);

    switch (el.type) {
      case 'text':
        if (el.paramName) {
          componentRef.instance.text = this.labjson.filter((value) => value.param.name === el.paramName)[0].value;
        }
        break;
    }
  }
}
