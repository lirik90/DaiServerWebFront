import { Component, OnInit } from '@angular/core';

import { Device, DeviceItem, ItemType } from "../../house";
import { HouseService } from "../../house.service";

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['../../../houses/list/list.component.css', './devices.component.css']
})
export class DevicesComponent implements OnInit {
  devices: Device[];
  sel_dev: Device;

  constructor(
    private houseService: HouseService,
  ) {}

  ngOnInit() {
    this.devices = this.houseService.house.devices;
    this.itemtypes = this.houseService.house.itemTypes;
  }

  select(dev: Device): void {
    if (this.sel_dev == dev) {
      this.sel_dev = undefined;
      this.sel_item = undefined;
    } else
      this.sel_dev = dev;
  }
  
  remove(dev: Device): void {
    // Dialog
  }

  add(): void {
    this.sel_dev = new Device();
    this.sel_dev.id = 0;
    this.devices.push(this.sel_dev);
  }

  save(): void {
    this.sel_dev.name = this.sel_dev.name.trim();
    if (!this.sel_dev.name) return;
  }

  sel_item: DeviceItem;
  itemtypes: ItemType[];

  select_item(item: DeviceItem): void {
    this.sel_item = this.sel_item == item ? undefined : item;
  }
  
  remove_item(dev: Device): void {
    // Dialog
  }

  add_item(): void {
    this.sel_item = new DeviceItem();
    this.sel_item.id = 0;
    this.sel_item.name = '';
    this.sel_item.device_id = this.sel_dev.id;
    this.sel_dev.items.push(this.sel_item);
  }

  save_item(): void {
    this.sel_item.name = this.sel_item.name.trim();
    if (!this.sel_item.name) return;
  }
}
