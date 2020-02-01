import {Component, OnInit, Input, OnChanges} from '@angular/core';

import {Device, Device_Item, Device_Item_Type, Section} from '../../scheme';
import {SchemeService} from '../../scheme.service';
import {ByteTools, WebSocketBytesService} from '../../../web-socket.service';

import {StructType, ChangeTemplate} from '../settings';

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['../settings.css', './devices.component.css']
})
export class DevicesComponent extends ChangeTemplate<Device> implements OnInit {
  constructor(
    wsbService: WebSocketBytesService,
    schemeService: SchemeService,
  ) {
    super(StructType.Devices, wsbService, schemeService, Device);
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

  saveObject(obj: Device): Uint8Array {
    const name = ByteTools.saveQString(obj.name);
    const extra = ByteTools.saveQVariantList(obj.extra ? obj.extra.trim().split(',') : []);
    const view = new Uint8Array(12 + name.length + extra.length);
    let pos = 0;
    ByteTools.saveInt32(obj.id, view, pos);
    pos += 4;
    view.set(name, pos);
    pos += name.length;
    view.set(extra, pos);
    pos += extra.length;
    ByteTools.saveInt32(obj.plugin_id, view, pos);
    pos += 4;
    ByteTools.saveInt32(obj.check_interval, view, pos);
    // pos += 4;
    return view;
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
    wsbService: WebSocketBytesService,
    schemeService: SchemeService,
  ) {
    super(StructType.DeviceItems, wsbService, schemeService, Device_Item);
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

  saveObject(obj: Device_Item): Uint8Array {
    const name = ByteTools.saveQString(obj.name);
    const extra = ByteTools.saveQVariantList(obj.extra ? obj.extra.trim().split(',') : []);
    const view = new Uint8Array(20 + name.length + extra.length);
    let pos = 0;
    ByteTools.saveInt32(obj.id, view);
    pos += 4;
    view.set(name, pos);
    pos += name.length;
    ByteTools.saveInt32(obj.type_id, view, pos);
    pos += 4;
    view.set(extra, pos);
    pos += extra.length;
    ByteTools.saveInt32(obj.parent_id, view, pos);
    pos += 4;
    ByteTools.saveInt32(obj.device_id, view, pos);
    pos += 4;
    ByteTools.saveInt32(obj.group_id, view, pos);
    pos += 4;
    return view;
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
