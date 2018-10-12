import { Component, OnInit, Input } from '@angular/core';

import { HouseService } from "../../house.service";
import { ItemType, SignType, GroupType, ParamItem, Status } from "../../house";

import { Cmd } from "../../control.service";
import { ByteTools, WebSocketBytesService } from "../../../web-socket.service";

import { ChangeState, ChangeInfo, ChangeTemplate } from "../settings";

@Component({
  selector: 'app-group-types',
  templateUrl: './group-types.component.html',
  styleUrls: ['../settings.css', './group-types.component.css']
})
export class GroupTypesComponent extends ChangeTemplate<GroupType> implements OnInit {
  constructor(
    wsbService: WebSocketBytesService,
    houseService: HouseService,
  ) {
    super(Cmd.StructModifyGroupTypes, wsbService, houseService, GroupType);
  }

  getObjects(): GroupType[] {
    return this.houseService.house.groupTypes;
  }

  ngOnInit() {
    this.fillItems();
  }

  saveObject(obj: GroupType): Uint8Array {
    let name = ByteTools.saveQString(obj.name);
    let view = new Uint8Array(4 + name.length);
    ByteTools.saveInt32(obj.id, view);
    view.set(name, 4);
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

  constructor(
    wsbService: WebSocketBytesService,
    houseService: HouseService,
  ) {
    super(Cmd.StructModifyGroupItemTypes, wsbService, houseService, ItemType);
  }

  getObjects(): ItemType[] {
    return this.houseService.house.itemTypes;
  }

  ngOnInit() {
    this.signTypes = this.houseService.house.signTypes;
    this.fillItems();
  }

  inititem(obj: ItemType): void {
    obj.name = '';
    obj.title = '';
    obj.groupType_id = this.grouptype.id;
  }

  saveObject(obj: ItemType): Uint8Array {
    let name = ByteTools.saveQString(obj.name);
    let view = new Uint8Array(4 + name.length);
    ByteTools.saveInt32(obj.id, view);
    view.set(name, 4);
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
    super(Cmd.StructModifyGroupParamTypes, wsbService, houseService, ParamItem);
  }

  getObjects(): ParamItem[] {
    return this.houseService.house.params;
  }

  ngOnInit() {
    this.fillItems();
  }

  inititem(obj: ParamItem): void {
    obj.name = '';
    obj.title = '';
    obj.groupType_id = this.grouptype.id;
  }

  saveObject(obj: ParamItem): Uint8Array {
    let name = ByteTools.saveQString(obj.name);
    let view = new Uint8Array(4 + name.length);
    ByteTools.saveInt32(obj.id, view);
    view.set(name, 4);
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
    super(Cmd.StructModifyGroupStatuses, wsbService, houseService, Status);
  }

  getObjects(): Status[] {
    return []; // this.houseService.house.statusTypes;
  }

  ngOnInit() {
    this.fillItems();
  }

  inititem(obj: Status): void {
    obj.name = '';
    obj.groupType_id = this.grouptype.id;
  }

  saveObject(obj: Status): Uint8Array {
    let name = ByteTools.saveQString(obj.name);
    let view = new Uint8Array(4 + name.length);
    ByteTools.saveInt32(obj.id, view);
    view.set(name, 4);
    return view;
  }
}

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
