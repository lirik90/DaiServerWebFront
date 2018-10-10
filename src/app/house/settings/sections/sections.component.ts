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
  styleUrls: ['../../../houses/list/list.component.css', './sections.component.css']
})
export class SectionsComponent extends ChangeTemplate<Section> implements OnInit {
  constructor(
    private houseService: HouseService,
    private settingsService: SettingsService,
    private wsbService: WebSocketBytesService,
  ) {
    super(Section);
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

  save(): void {
    let data = this.getChangedData();
    this.wsbService.send(Cmd.StructModifySections, this.houseService.house.id, data);
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
  styleUrls: ['../../../houses/list/list.component.css', './sections.component.css']
})
export class GroupsComponent extends ChangeTemplate<Group> implements OnInit {
  @Input() sct: Section;

  groupTypes: GroupType[];

  constructor(
    private houseService: HouseService,
    private wsbService: WebSocketBytesService,
  ) {
    super(Group);
  }

  getObjects(): Group[] {
    return this.sct.groups;
  }

  ngOnInit() {
    this.groupTypes = this.houseService.house.groupTypes;
    this.fillItems();
  }

  initItem(obj: Group): void {
    obj.section_id = this.sct.id;
  }

  save(): void {
    let data = this.getChangedData();
    this.wsbService.send(Cmd.StructModifyGroups, this.houseService.house.id, data);
  }

  saveObject(obj: Group): Uint8Array {
    let view = new Uint8Array(20);
    return view;
  }
}

