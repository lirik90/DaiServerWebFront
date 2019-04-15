import { ByteTools } from "../../../web-socket.service";
import { Component, OnInit, Input } from '@angular/core';
import { View, ViewItem, DeviceItem } from "../../house";
import { ChangeTemplate, StructType } from "../settings";
import { SettingsService } from "../settings.service";
import { WebSocketBytesService } from "../../../web-socket.service";
import { HouseService } from "../../house.service";

@Component({
  selector: 'app-views',
  templateUrl: './views.component.html',
  styleUrls: ['../settings.css', './views.component.css']
})
export class ViewsComponent extends ChangeTemplate<View> implements OnInit {

  constructor(
    wsbService: WebSocketBytesService,
    houseService: HouseService,
  ) {
    super(StructType.View, wsbService, houseService, View);
  }

  getObjects(): View[] {
    return this.houseService.house.views;
  }

  ngOnInit() {
    this.fillItems();
  }

  saveObject(obj: View): Uint8Array {
    let name = ByteTools.saveQString(obj.name);
    let view = new Uint8Array(4 + name.length);
    let pos = 0;
    ByteTools.saveInt32(obj.id, view, pos); pos += 4;
    view.set(name, pos); pos += name.length;
    return view;
  }
}

@Component({
  selector: 'app-viewitems',
  templateUrl: './viewitems.component.html',
  styleUrls: ['../settings.css', './views.component.css']
})
export class ViewItemsComponent extends ChangeTemplate<ViewItem> implements OnInit {
  @Input() view: View;

  dev_items: DeviceItem[];
  view_items: ViewItem[] = [];

  constructor(
    wsbService: WebSocketBytesService,
    houseService: HouseService,
    private settingsService: SettingsService,
  ) {
    super(StructType.ViewItem, wsbService, houseService, ViewItem);
  }

  getObjects(): ViewItem[] {
    return this.view_items;
  }

  ngOnInit() {
    this.fill_device_items();
    this.settingsService.getViewItems(this.view.id).subscribe(api => {
      this.view_items = api.results;
      for (let view_item of this.view_items)
      {
        for (const dev_item of this.dev_items)
        {
          if (view_item.item_id == dev_item.id)
          {
            (<any>view_item).title = this.title(dev_item);
            break;
          }
        }
      }
      this.fillItems();
    });
  }

  fill_device_items(): void
  {
    this.dev_items = [];
    for (const dev of this.houseService.house.devices)
    {
      for (const item of dev.items)
      {
        this.dev_items.push(item);
      }
    }
  }

  title(item: DeviceItem = undefined): string {
    if (item.name.length)
      return item.name;
    else if (item.type && item.type.title.length)
      return item.type.title;
    return '';
  }

  initItem(obj: ViewItem): void {
    obj.view_id = this.view.id;
    obj.item_id = 0;
  }

  saveObject(obj: ViewItem): Uint8Array {
    let view = new Uint8Array(12);
    let pos = 0;
    ByteTools.saveInt32(obj.id, view, pos); pos += 4;
    ByteTools.saveInt32(obj.view_id, view, pos); pos += 4;
    ByteTools.saveInt32(obj.item_id, view, pos); pos += 4;
    return view;
  }
}
