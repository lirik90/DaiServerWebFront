import { Component, OnInit } from '@angular/core';

import { HouseService } from "../../house.service";
import { SignType } from "../../house";

import { ByteTools, WebSocketBytesService } from "../../../web-socket.service";

import { StructType, ChangeState, ChangeInfo, ChangeTemplate } from "../settings";

@Component({
  selector: 'app-sign-types',
  templateUrl: './sign-types.component.html',
  styleUrls: ['../settings.css', './sign-types.component.css']
})
export class SignTypesComponent extends ChangeTemplate<SignType> implements OnInit {
  constructor(
    wsbService: WebSocketBytesService,
    houseService: HouseService,
  ) {
    super(StructType.Signs, wsbService, houseService, SignType);
  }

  getObjects(): SignType[] {
    return this.houseService.house.signTypes;
  }

  ngOnInit() {
    this.fillItems();
  }

  saveObject(obj: SignType): Uint8Array {
    let name = ByteTools.saveQString(obj.name);
    let view = new Uint8Array(4 + name.length);
    ByteTools.saveInt32(obj.id, view);
    view.set(name, 4);
    return view;
  }
}
