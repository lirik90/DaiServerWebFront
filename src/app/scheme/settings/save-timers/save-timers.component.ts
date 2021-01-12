import { Component, OnInit } from '@angular/core';

import { SchemeService } from "../../scheme.service";
import { Save_Timer } from "../../scheme";

import { ByteTools, WebSocketBytesService } from "../../../web-socket.service";

import { StructType, ChangeState, ChangeInfo, ChangeTemplate } from "../settings";
import { SettingsService } from "../settings.service";

@Component({
  selector: 'app-save-timers',
  templateUrl: './save-timers.component.html',
  styleUrls: ['../settings.css', './save-timers.component.css']
})
export class SaveTimersComponent extends ChangeTemplate<Save_Timer> implements OnInit {
  constructor(
    wsbService: WebSocketBytesService,
    schemeService: SchemeService,
    private settingsService: SettingsService
  ) {
    super(StructType.SaveTimers, wsbService, schemeService, Save_Timer, 'savetimers');
  }

  save_timers: Save_Timer[];
  getObjects(): Save_Timer[] {
    return this.save_timers;
  }

  ngOnInit() {
    this.settingsService.getSaveTimers().subscribe(api => {
      this.save_timers = api.results;
      this.fillItems();
    });
  }

  initItem(obj: Save_Timer): void
  {
    obj.interval = 1000;
  }

  saveObject(obj: Save_Timer): Uint8Array {
    console.log(obj);
    let view = new Uint8Array(8);
    ByteTools.saveInt32(obj.id, view, 0);
    ByteTools.saveInt32(obj.interval, view, 4);
    return view;
  }
}
