import { Component, OnInit, Input } from '@angular/core';

import { HouseService } from "../../house.service";
import { ItemType, SignType, GroupType, ParamItem, Status, Codes, SaveTimer } from "../../house";

import { ByteTools, WebSocketBytesService } from "../../../web-socket.service";

import { StructType, ChangeState, ChangeInfo, ChangeTemplate } from "../settings";

import { SettingsService } from "../settings.service";

@Component({
  selector: 'app-group-types',
  templateUrl: './group-types.component.html',
  styleUrls: ['../settings.css', './group-types.component.css']
})
export class GroupTypesComponent extends ChangeTemplate<GroupType> implements OnInit 
{
  
  codes: Codes[];
  
  constructor(
    wsbService: WebSocketBytesService,
    houseService: HouseService,
    private settingsService: SettingsService,
  ) {
    super(StructType.GroupTypes, wsbService, houseService, GroupType);
  }

  getObjects(): GroupType[] {
    return this.houseService.house.groupTypes;
  }

  ngOnInit() {
    //this.fillItems();
    this.settingsService.getCodes().subscribe(codes => {
      this.codes = codes;
      this.fillItems();
    });
  }

  saveObject(obj: GroupType): Uint8Array {
    let name = ByteTools.saveQString(obj.name);
    let title = ByteTools.saveQString(obj.title);
    let desc = ByteTools.saveQString(obj.description);
    let view = new Uint8Array(8 + name.length + title.length + desc.length);
    ByteTools.saveInt32(obj.id, view);
    view.set(name, 4);
    view.set(title, 4 + name.length);
    ByteTools.saveInt32(obj.code_id, view, 4 + name.length + title.length);
    view.set(desc, 8 + name.length + title.length);
    return view;
  }
}

@Component({
  selector: 'app-item-types',
  templateUrl: './item-types.component.html',
  styleUrls: ['../settings.css', './group-types.component.css']
})
export class ItemTypesComponent extends ChangeTemplate<ItemType> implements OnInit {
  @Input() grouptype: GroupType;

  signTypes: SignType[];
  save_timers: SaveTimer[];

  constructor(
    wsbService: WebSocketBytesService,
    houseService: HouseService,
    private settingsService: SettingsService
  ) {
    super(StructType.DeviceItemTypes, wsbService, houseService, ItemType);
  }

  getObjects(): ItemType[] {
    return this.houseService.house.itemTypes.filter(obj => obj.groupType_id === this.grouptype.id);
  }

  ngOnInit() {
    this.settingsService.getSaveTimers().subscribe(api => {
      this.save_timers = api.results;
      this.signTypes = this.houseService.house.signTypes;
      this.fillItems();
    });
  }

  initItem(obj: ItemType): void {
    obj.name = '';
    obj.title = '';
    obj.groupType_id = this.grouptype.id;
  }

  saveObject(obj: ItemType): Uint8Array {
    let name = ByteTools.saveQString(obj.name);
    let title = ByteTools.saveQString(obj.title);
    let view = new Uint8Array(19 + name.length + title.length);
    let pos = 0;
    ByteTools.saveInt32(obj.id, view); pos += 4;
    view.set(name, pos); pos += name.length;
    view.set(title, pos); pos += title.length;
    ByteTools.saveInt32(obj.groupType_id, view, pos); pos += 4;
    view[pos] = obj.isRaw ? 1 : 0; pos += 1;
    ByteTools.saveInt32(obj.sign_id, view, pos); pos += 4;
    view[pos] = obj.registerType; pos += 1;
    view[pos] = obj.saveAlgorithm; pos += 1;
    ByteTools.saveInt32(obj.save_timer_id, view, pos); pos += 4;
    return view;
  }
}

@Component({
  selector: 'app-param-types',
  templateUrl: './param-types.component.html',
  styleUrls: ['../settings.css', './group-types.component.css']
})
export class ParamTypesComponent extends ChangeTemplate<ParamItem> implements OnInit {
  @Input() grouptype: GroupType;

  constructor(
    wsbService: WebSocketBytesService,
    houseService: HouseService,
  ) {
    super(StructType.GroupParamTypes, wsbService, houseService, ParamItem);
  }

  getObjects(): ParamItem[] {
    return this.houseService.house.params.filter(obj => obj.groupType_id === this.grouptype.id);
  }

  ngOnInit() {
    this.fillItems();
  }

  initItem(obj: ParamItem): void {
    obj.name = '';
    obj.title = '';
    obj.groupType_id = this.grouptype.id;
  }

  saveObject(obj: ParamItem): Uint8Array {
    let name = ByteTools.saveQString(obj.name);
    let title = ByteTools.saveQString(obj.title);
    let desc = ByteTools.saveQString(obj.description);
    let view = new Uint8Array(13 + name.length + title.length + desc.length);
    let pos = 0;
    ByteTools.saveInt32(obj.id, view); pos += 4;
    view.set(name, pos); pos += name.length;
    view.set(title, pos); pos += title.length;
    view.set(desc, pos); pos += desc.length;
    view[pos] = obj.type; pos += 1;
    ByteTools.saveInt32(obj.groupType_id, view, pos); pos += 4;
    ByteTools.saveInt32(obj.parent_id, view, pos); pos += 4;
    return view;
  }
}

@Component({
  selector: 'app-statuses',
  templateUrl: './statuses.component.html',
  styleUrls: ['../settings.css', './group-types.component.css']
})
export class StatusesComponent extends ChangeTemplate<Status> implements OnInit {
  @Input() grouptype: GroupType;

  constructor(
    wsbService: WebSocketBytesService,
    houseService: HouseService,
  ) {
    super(StructType.GroupStatusInfo, wsbService, houseService, Status);
  }

  getObjects(): Status[] {
    return this.houseService.house.statuses.filter(obj => obj.groupType_id === this.grouptype.id);
  }

  ngOnInit() {
    this.fillItems();
  }

  initItem(obj: Status): void {
    obj.name = '';
    obj.groupType_id = this.grouptype.id;
  }

  saveObject(obj: Status): Uint8Array {
    let name = ByteTools.saveQString(obj.name);
    let title = ByteTools.saveQString(obj.text);
    let view = new Uint8Array(13 + name.length + title.length); 
    let pos = 0;
    ByteTools.saveInt32(obj.id, view); pos += 4;
    view.set(name, pos); pos += name.length;
    view.set(title, pos); pos += title.length;
    ByteTools.saveInt32(obj.type_id, view, pos); pos += 4;
    ByteTools.saveInt32(obj.groupType_id, view, pos); pos += 4;
    view[pos] = obj.inform ? 1 : 0; pos += 1;
    return view;
  }
}

// Deprecated
export class OtherTypesComponent implements OnInit { 
  paramItems: ParamItem[];
  itemTypes: ItemType[];
  groupTypes: GroupType[];
  statuses: Status[];

  status: Status;
  param: ParamItem;
  sel_itype: ItemType;
  sel_gtype: GroupType;

  constructor(
    private houseService: HouseService,
  ) {}

  ngOnInit() {
    this.paramItems = this.houseService.house.params;
    this.groupTypes = this.houseService.house.groupTypes;
    this.statuses = [];
  }

  select(gtype: GroupType): void {
    if (this.sel_gtype == gtype) {
      this.sel_gtype = undefined;
      this.sel_itype = undefined;
    } else {
      this.sel_gtype = gtype;

      this.itemTypes = [];
      let itemTypes = this.houseService.house.itemTypes;
      for (let itype of itemTypes)
        if (itype.groupType_id == this.sel_gtype.id)
          this.itemTypes.push(itype);
    }
  }
  
  remove(gtype: GroupType): void {
    // Dialog
  }

  add(): void {
    this.sel_gtype = new GroupType();
    this.sel_gtype.id = 0;
    this.groupTypes.push(this.sel_gtype);
  }

  save(): void {
    this.sel_gtype.name = this.sel_gtype.name.trim();
    if (!this.sel_gtype.name) return;
  }

  select_it(itype: ItemType): void {
    this.sel_itype = this.sel_itype == itype ? undefined : itype;
  }
  
  remove_it(itype: ItemType): void {
    // Dialog
  }

  add_it(): void {
    this.sel_itype = new ItemType();
    this.sel_itype.id = 0;
    this.sel_itype.title = '';
    this.sel_itype.groupType_id = this.sel_gtype.id;
    this.itemTypes.push(this.sel_itype);
  }

  save_it(): void {
    this.sel_itype.name = this.sel_itype.name.trim();
    if (!this.sel_itype.name) return;
  }

  select_param(param: ParamItem): void {
    this.param = this.param == param ? undefined : param;
  }
  
  remove_param(param: ParamItem): void {
    // Dialog
  }

  add_param(): void {
    this.param = new ParamItem();
    this.param.id = 0;
    this.paramItems.push(this.param);
  }

  save_param(): void {
    this.param.name = this.param.name.trim();
    if (!this.param.name) return;
  }

  select_status(status: Status): void {
    this.status = this.status == status ? undefined : status;
  }
  
  remove_status(status: Status): void {
    // Dialog
  }

  add_status(): void {
    this.status = new Status();
    this.status.id = 0;
    this.statuses.push(this.status);
  }

  save_status(): void {
    this.status.name = this.status.name.trim();
    if (!this.status.name) return;
  }
}
