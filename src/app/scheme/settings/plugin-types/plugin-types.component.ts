import { Component, OnInit } from '@angular/core';

import { SchemeService } from "../../scheme.service";
import { Plugin_Type } from "../../scheme";

import { ChangeState, ChangeInfo, ChangeTemplate } from "../settings";
import { SettingsService } from "../settings.service";

@Component({
  selector: 'app-plugin-types',
  templateUrl: './plugin-types.component.html',
  styleUrls: ['../settings.css', './plugin-types.component.css']
})
export class PluginTypesComponent extends ChangeTemplate<Plugin_Type> implements OnInit {
  checkers: Plugin_Type[];

  constructor(
    schemeService: SchemeService,
    private settingsService: SettingsService,
  ) {
    super(schemeService, Plugin_Type, 'plugin_type');
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
}
