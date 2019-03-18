import { Component, OnInit, Input } from '@angular/core';

import { Device, DeviceItem, ItemType, Section } from "../../house";
import { HouseService } from "../../house.service";
import { ByteTools, WebSocketBytesService } from "../../../web-socket.service";

import { StructType, ChangeState, ChangeInfo, ChangeTemplate } from "../settings";

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
  }

  saveObject(obj: Device): Uint8Array {
    let name = ByteTools.saveQString(obj.name);
    let view = new Uint8Array(12 + name.length);
    ByteTools.saveInt32(obj.id, view);
    view.set(name, 4);
    ByteTools.saveInt32(obj.address, view, 4 + name.length);
    ByteTools.saveInt32(obj.checker_id, view, 8 + name.length);
    return view;
  }
}

@Component({
  selector: 'app-deviceitems',
  templateUrl: './deviceitems.component.html',
  styleUrls: ['../settings.css', './devices.component.css']
})
export class DeviceItemsComponent extends ChangeTemplate<DeviceItem> implements OnInit {
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
  }

  title(item: DeviceItem = undefined): string {
    if (!item)
      item = this.sel_item.obj;
    if (item.name.length)
      return item.name;
    else if (item.type && item.type.title.length)
      return item.type.title;
    return '';
  }

  typeChanged(): void {
    this.itemChanged();
    this.sel_item.obj.group_id = 0;
    if (this.sel_item.obj.type_id > 0) {
      for (const itemtype of this.itemtypes) {
        if (this.sel_item.obj.type_id == itemtype.id) {
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
  }

  saveObject(obj: DeviceItem): Uint8Array {
    let extra = JSON.parse(obj.extra);
    let extra_arr = [];
    let extra_size = 0;
    for (let p in extra) {
      const p_name = ByteTools.saveQString(p);
      const p_value = ByteTools.saveQVariant(extra[p]);
      extra_arr.push({ name: p_name, value: p_value });
      extra_size += p_name.length + p_value.length;
    }

    let name = ByteTools.saveQString(obj.name);
    let view = new Uint8Array(24 + name.length + extra_size);
    let pos = 0;
    ByteTools.saveInt32(obj.id, view); pos += 4;
    view.set(name, pos); pos += name.length;
    ByteTools.saveInt32(obj.device_id, view, pos); pos += 4;
    ByteTools.saveInt32(obj.type_id, view, pos); pos += 4;
    ByteTools.saveInt32(extra_arr.length, view, pos); pos += 4;
    for (let e of extra_arr) {
      view.set(e.name, pos); pos += e.name.length;
      view.set(e.value, pos); pos += e.value.length;
    }

    ByteTools.saveInt32(obj.group_id, view, pos); pos += 4;
    ByteTools.saveInt32(obj.parent_id, view, pos); pos += 4;
    return view;
  }
}
