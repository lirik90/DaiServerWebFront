import { Component, OnInit } from '@angular/core';

import { SchemeService } from "../../scheme.service";
import { DIG_Status_Category } from "../../scheme";

import { ByteTools, WebSocketBytesService } from "../../../web-socket.service";

import { StructType, ChangeState, ChangeInfo, ChangeTemplate } from "../settings";

@Component({
  selector: 'app-dig-status-category',
  templateUrl: './dig-status-category.component.html',
  styleUrls: ['../settings.css', './dig-status-category.component.css']
})
export class DIG_Status_Category_Component extends ChangeTemplate<DIG_Status_Category> implements OnInit {
  constructor(
    wsbService: WebSocketBytesService,
    schemeService: SchemeService,
  ) {
    super(StructType.DIG_STATUS_CATEGORY, wsbService, schemeService, DIG_Status_Category, 'digstatuscategory');
  }

  getObjects(): DIG_Status_Category[] {
    return this.schemeService.scheme.dig_status_category;
  }

  ngOnInit() {
    this.fillItems();
  }

  saveObject(obj: DIG_Status_Category): Uint8Array {
    let name = ByteTools.saveQString(obj.name);
    let title = ByteTools.saveQString(obj.title);
    let color = ByteTools.saveQString(obj.color);
    let view = new Uint8Array(4 + name.length + title.length + color.length);
    let pos = 0;
    ByteTools.saveInt32(obj.id, view); pos += 4;
    view.set(name, pos); pos += name.length;
    view.set(title, pos); pos += title.length;
    view.set(color, pos); pos += color.length;
    return view;
  }
}
