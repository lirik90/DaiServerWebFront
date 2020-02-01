import { Component, OnInit } from '@angular/core';

import { SchemeService } from "../../scheme.service";
import { Sign_Type } from "../../scheme";

import { ByteTools, WebSocketBytesService } from "../../../web-socket.service";

import { StructType, ChangeState, ChangeInfo, ChangeTemplate } from "../settings";

@Component({
  selector: 'app-sign-types',
  templateUrl: './sign-types.component.html',
  styleUrls: ['../settings.css', './sign-types.component.css']
})
export class SignTypesComponent extends ChangeTemplate<Sign_Type> implements OnInit {
  constructor(
    wsbService: WebSocketBytesService,
    schemeService: SchemeService,
  ) {
    super(StructType.Signs, wsbService, schemeService, Sign_Type);
  }

  getObjects(): Sign_Type[] {
    return this.schemeService.scheme.sign_type;
  }

  ngOnInit() {
    this.fillItems();
  }

  saveObject(obj: Sign_Type): Uint8Array {
    let name = ByteTools.saveQString(obj.name);
    let view = new Uint8Array(4 + name.length);
    ByteTools.saveInt32(obj.id, view);
    view.set(name, 4);
    return view;
  }
}
