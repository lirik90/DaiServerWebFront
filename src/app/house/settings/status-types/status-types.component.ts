import { Component, OnInit } from '@angular/core';

import { HouseService } from "../../house.service";
import { StatusType } from "../../house";

import { ByteTools, WebSocketBytesService } from "../../../web-socket.service";

import { StructType, ChangeState, ChangeInfo, ChangeTemplate } from "../settings";

@Component({
  selector: 'app-status-types',
  templateUrl: './status-types.component.html',
  styleUrls: ['../settings.css', './status-types.component.css']
})
export class StatusTypesComponent extends ChangeTemplate<StatusType> implements OnInit {
  constructor(
    wsbService: WebSocketBytesService,
    houseService: HouseService,
  ) {
    super(StructType.GroupStatusTypes, wsbService, houseService, StatusType);
  }

  getObjects(): StatusType[] {
    return this.houseService.house.statusTypes;
  }

  ngOnInit() {
    this.fillItems();
  }

  saveObject(obj: StatusType): Uint8Array {
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
