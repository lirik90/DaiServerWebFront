import { Input, Component, OnInit } from '@angular/core';

import { HouseService } from "../../house.service";
import { Section, Group, GroupType } from "../../house";
import { Cmd } from "../../control.service";
import { ByteTools, WebSocketBytesService } from "../../../web-socket.service";
import { SettingsService } from "../settings.service";
import { ChangeState, ChangeInfo, ChangeTemplate } from "../settings";

@Component({
  selector: 'app-sections',
  templateUrl: './sections.component.html',
  styleUrls: ['../settings.css', './sections.component.css']
})
export class SectionsComponent extends ChangeTemplate<Section> implements OnInit {
  constructor(
    wsbService: WebSocketBytesService,
    houseService: HouseService,
    private settingsService: SettingsService,
  ) {
    super(Cmd.StructModifySections, wsbService, houseService, Section);
  }

  getObjects(): Section[] {
    return this.houseService.house.sections;
  }

  ngOnInit() {
    this.fillItems();

    /*
    // Dialog
    this.sections = this.sections.filter(s => s !== sct);
    this.settingsService.deleteSection(sct).subscribe(_ => {
      // this.controlService.deleteSection(sct);
    });*/
  }

  saveObject(obj: Section): Uint8Array {
    let name = ByteTools.saveQString(obj.name);
    let view = new Uint8Array(12 + name.length);
    return view;
  }
}

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['../settings.css', './sections.component.css']
})
export class GroupsComponent extends ChangeTemplate<Group> implements OnInit {
  @Input() sct: Section;

  groupTypes: GroupType[];

  constructor(
    wsbService: WebSocketBytesService,
    houseService: HouseService,
  ) {
    super(Cmd.StructModifyGroups, wsbService, houseService, Group);
  }

  getObjects(): Group[] {
    return this.sct.groups;
  }

  ngOnInit() {
    this.groupTypes = this.houseService.house.groupTypes;
    this.fillItems();
  }

  title(item: Group = undefined): string {
    if (item === undefined)
      item = this.sel_item.obj;
    return item.type ? item.type.title : '';
  }

  initItem(obj: Group): void {
    obj.section_id = this.sct.id;
  }

  saveObject(obj: Group): Uint8Array {
    let view = new Uint8Array(20);
    return view;
  }
}

