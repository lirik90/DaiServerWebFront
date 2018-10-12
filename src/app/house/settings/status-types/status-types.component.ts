import { Component, OnInit } from '@angular/core';

import { HouseService } from "../../house.service";
import { StatusType } from "../../house";

import { Cmd } from "../../control.service";
import { ByteTools, WebSocketBytesService } from "../../../web-socket.service";

import { ChangeState, ChangeInfo, ChangeTemplate } from "../settings";

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
    super(Cmd.StructModifyStatusTypes, wsbService, houseService, StatusType);
  }

  getObjects(): StatusType[] {
    return []; // this.houseService.house.satusTypes;
  }

  ngOnInit() {
    this.fillItems();
  }

  saveObject(obj: StatusType): Uint8Array {
    let name = ByteTools.saveQString(obj.name);
    let view = new Uint8Array(4 + name.length);
    ByteTools.saveInt32(obj.id, view);
    view.set(name, 4);
    return view;
  }
}
