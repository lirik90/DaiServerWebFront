import { Component, OnInit } from '@angular/core';

import { SchemeService } from "../../scheme.service";
import { Plugin_Type } from "../../scheme";

import { ByteTools, WebSocketBytesService } from "../../../web-socket.service";

import { StructType, ChangeState, ChangeInfo, ChangeTemplate } from "../settings";
import { SettingsService } from "../settings.service";

@Component({
  selector: 'app-plugin-types',
  templateUrl: './plugin-types.component.html',
  styleUrls: ['../settings.css', './plugin-types.component.css']
})
export class PluginTypesComponent extends ChangeTemplate<Plugin_Type> implements OnInit {
  checkers: Plugin_Type[];

  constructor(
    wsbService: WebSocketBytesService,
    schemeService: SchemeService,
    private settingsService: SettingsService,
  ) {
    super(StructType.PluginType, wsbService, schemeService, Plugin_Type);
  }

  getObjects(): Plugin_Type[] {
    return this.checkers;
  }

  ngOnInit() {
    this.settingsService.getPluginTypes().subscribe(ret => {
      this.checkers = ret.results;
      this.fillItems();
    });
  }

  saveObject(obj: Plugin_Type): Uint8Array {
    let name = ByteTools.saveQString(obj.name);
    let view = new Uint8Array(12 + name.length);
    let pos = 0;
    ByteTools.saveInt32(obj.id, view, pos); pos += 4;
    view.set(name, pos); pos += name.length; 
    ByteTools.saveInt32(0, view, pos); pos += 4;
    ByteTools.saveInt32(0, view, pos); pos += 4;
    return view;
  }
}
