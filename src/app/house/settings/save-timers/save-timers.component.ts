import { Component, OnInit } from '@angular/core';

import { HouseService } from "../../house.service";
import { SaveTimer } from "../../house";

import { ByteTools, WebSocketBytesService } from "../../../web-socket.service";

import { StructType, ChangeState, ChangeInfo, ChangeTemplate } from "../settings";
import { SettingsService } from "../settings.service";

@Component({
  selector: 'app-save-timers',
  templateUrl: './save-timers.component.html',
  styleUrls: ['../settings.css', './save-timers.component.css']
})
export class SaveTimersComponent extends ChangeTemplate<SaveTimer> implements OnInit {
  constructor(
    wsbService: WebSocketBytesService,
    houseService: HouseService,
    private settingsService: SettingsService
  ) {
    super(StructType.SaveTimers, wsbService, houseService, SaveTimer);
  }

  save_timers: SaveTimer[];
  getObjects(): SaveTimer[] {
    return this.save_timers;
  }

  ngOnInit() {
    this.settingsService.getSaveTimers().subscribe(api => {
      this.save_timers = api.results;
      this.fillItems();
    });
  }

  initItem(obj: SaveTimer): void
  {
    obj.interval = 1000;
  }

  saveObject(obj: SaveTimer): Uint8Array {
    console.log(obj);
    let view = new Uint8Array(8);
    ByteTools.saveInt32(obj.id, view, 0);
    ByteTools.saveInt32(obj.interval, view, 4);
    return view;
  }
}
