import { Component, OnInit } from '@angular/core';

import { HouseService } from "../../house.service";
import { CheckerType } from "../../house";

import { ByteTools, WebSocketBytesService } from "../../../web-socket.service";

import { StructType, ChangeState, ChangeInfo, ChangeTemplate } from "../settings";
import { SettingsService } from "../settings.service";

@Component({
  selector: 'app-checker-types',
  templateUrl: './checker-types.component.html',
  styleUrls: ['../settings.css', './checker-types.component.css']
})
export class CheckerTypesComponent extends ChangeTemplate<CheckerType> implements OnInit {
  checkers: CheckerType[];

  constructor(
    wsbService: WebSocketBytesService,
    houseService: HouseService,
    private settingsService: SettingsService,
  ) {
    super(StructType.CheckerType, wsbService, houseService, CheckerType);
  }

  getObjects(): CheckerType[] {
    return this.checkers;
  }

  ngOnInit() {
    this.settingsService.getCheckerTypes().subscribe(ret => {
      this.checkers = ret.results;
      this.fillItems();
    });
  }

  saveObject(obj: CheckerType): Uint8Array {
    let name = ByteTools.saveQString(obj.name);
    let view = new Uint8Array(12 + name.length);
    ByteTools.saveInt32(obj.id, view);
    view.set(name, 4);
    ByteTools.saveInt32(0, view);
    ByteTools.saveInt32(0, view);
    return view;
  }
}
