import { Component, OnInit, Input } from '@angular/core';

import { Device, DeviceItem, ItemType, Section } from "../../house";
import { HouseService } from "../../house.service";
import { Cmd } from "../../control.service";
import { ByteTools, WebSocketBytesService } from "../../../web-socket.service";

import { ChangeState, ChangeInfo, ChangeTemplate } from "../settings";

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['../../../houses/list/list.component.css', './devices.component.css']
})
export class DevicesComponent extends ChangeTemplate<Device> implements OnInit {
  constructor(
    private houseService: HouseService,
    private wsbService: WebSocketBytesService,
  ) {
    super(Device);
  }

  getObjects(): Device[] {
    return this.houseService.house.devices;
  }

  ngOnInit() {
    this.fillItems();
  }

  save(): void {
    let data = this.getChangedData();
    this.wsbService.send(Cmd.StructModifyDevices, this.houseService.house.id, data);
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
  styleUrls: ['../../../houses/list/list.component.css', './devices.component.css']
})
export class DeviceItemsComponent extends ChangeTemplate<DeviceItem> implements OnInit {
  @Input() dev: Device;

  itemtypes: ItemType[];
  sections: Section[];

  constructor(
    private houseService: HouseService,
    private wsbService: WebSocketBytesService,
  ) {
    super(DeviceItem);
  }

  getObjects(): DeviceItem[] {
    return this.dev.items;
  }

  ngOnInit() {
    this.itemtypes = this.houseService.house.itemTypes;
    this.sections = this.houseService.house.sections;
    this.fillItems();
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

  save(): void {
    let data = this.getChangedData();
    this.wsbService.send(Cmd.StructModifyDeviceItems, this.houseService.house.id, data);
  }

  saveObject(obj: DeviceItem): Uint8Array {
    let name = ByteTools.saveQString(obj.name);
    let view = new Uint8Array(20 + name.length);
    ByteTools.saveInt32(obj.id, view);
    view.set(name, 4);
    let pos = 4 + name.length;
    ByteTools.saveInt32(this.dev.id, view, pos);
    ByteTools.saveInt32(obj.type_id, view, pos + 4);
    ByteTools.saveInt32(obj.unit, view, pos + 8);
    ByteTools.saveInt32(obj.group_id, view, pos + 12);
    ByteTools.saveInt32(obj.parent_id, view, pos + 16);
    return view;
  }
}
