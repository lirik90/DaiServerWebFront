import {Component, Input, OnChanges, OnInit} from '@angular/core';

import {Device, Device_Item, Device_Item_Type, Section} from '../../scheme';
import {SchemeService} from '../../scheme.service';

import {ChangeTemplate, Structure_Type} from '../settings';

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['../settings.css', './devices.component.css']
})
export class DevicesComponent extends ChangeTemplate<Device> implements OnInit {
  constructor(
    schemeService: SchemeService,
  ) {
    super(schemeService, Device, Structure_Type.ST_DEVICE);
  }

  getObjects(): Device[] {
    return this.schemeService.scheme.device;
  }

  ngOnInit() {
    this.fillItems();
    this.parse_extra();
  }

  initItem(obj: Device): void {
    obj.extra = null;
    obj.check_interval = 0;
  }

  parse_extra(): void {
    for (const item of this.items) {
      if (item.obj.extra != null) {
        const parsed_array = JSON.parse(item.obj.extra);
        item.obj.extra = parsed_array.join(', ');
      }
    }
  }
}

@Component({
  selector: 'app-deviceitems',
  templateUrl: './deviceitems.component.html',
  styleUrls: ['../settings.css', './devices.component.css']
})
export class DeviceItemsComponent extends ChangeTemplate<Device_Item> implements OnInit, OnChanges {
  @Input() dev: Device;

  itemtypes: Device_Item_Type[];
  sections: Section[];

  constructor(
    schemeService: SchemeService,
  ) {
    super(schemeService, Device_Item, Structure_Type.ST_DEVICE_ITEM);
  }

  getObjects(): Device_Item[] {
    return this.dev.items;
  }

  ngOnInit() {
    this.itemtypes = this.schemeService.scheme.device_item_type;
    this.sections = this.schemeService.scheme.section;
    this.fillItems();
    this.parse_extra();
  }

  ngOnChanges() {
    this.itemtypes = this.schemeService.scheme.device_item_type;
    this.sections = this.schemeService.scheme.section;
    this.fillItems();
    this.parse_extra();
  }

  title(item: Device_Item): string {
    if (!item) {
      item = this.sel_item.obj;
    }
    if (item.name.length) {
      return item.name;
    } else if (item.type && item.type.title.length) {
      return item.type.title;
    }
    return '';
  }

  typeChanged(): void {
    this.itemChanged();
    this.sel_item.obj.group_id = 0;
    if (this.sel_item.obj.type_id > 0) {
      for (const itemtype of this.itemtypes) {
        if (this.sel_item.obj.type_id === itemtype.id) {
          this.sel_item.obj.type = itemtype;
          break;
        }
      }
    }
  }

  initItem(obj: Device_Item): void {
    obj.name = '';
    obj.device_id = this.dev.id;
    obj.type_id = 0;
    obj.extra = null;
  }

  parse_extra(): void {
    for (const item of this.items) {
      if (item.obj.extra != null) {
        const parsed_array = JSON.parse(item.obj.extra);
        item.obj.extra = parsed_array.join(', ');
      }
    }
  }
}
