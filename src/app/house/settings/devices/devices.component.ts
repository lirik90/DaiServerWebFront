import {Component, OnInit, Input, OnChanges} from '@angular/core';

import {Device, DeviceItem, ItemType, Section} from '../../house';
import {HouseService} from '../../house.service';
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
    houseService: HouseService,
  ) {
    super(StructType.Devices, wsbService, houseService, Device);
  }

  getObjects(): Device[] {
    return this.houseService.house.devices;
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
    ByteTools.saveInt32(obj.checker_id, view, pos);
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
export class DeviceItemsComponent extends ChangeTemplate<DeviceItem> implements OnInit, OnChanges {
  @Input() dev: Device;

  itemtypes: ItemType[];
  sections: Section[];

  constructor(
    wsbService: WebSocketBytesService,
    houseService: HouseService,
  ) {
    super(StructType.DeviceItems, wsbService, houseService, DeviceItem);
  }

  getObjects(): DeviceItem[] {
    return this.dev.items;
  }

  ngOnInit() {
    this.itemtypes = this.houseService.house.itemTypes;
    this.sections = this.houseService.house.sections;
    this.fillItems();
    this.parse_extra();
  }

  ngOnChanges() {
    this.itemtypes = this.houseService.house.itemTypes;
    this.sections = this.houseService.house.sections;
    this.fillItems();
    this.parse_extra();
  }

  title(item: DeviceItem): string {
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

  initItem(obj: DeviceItem): void {
    obj.name = '';
    obj.device_id = this.dev.id;
    obj.type_id = 0;
    obj.extra = null;
  }

  saveObject(obj: DeviceItem): Uint8Array {
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
