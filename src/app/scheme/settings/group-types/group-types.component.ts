import {Component, OnInit, Input, OnChanges} from '@angular/core';

import { SchemeService } from "../../scheme.service";
import { Device_Item_Type, Sign_Type, DIG_Type, DIG_Param_Type, DIG_Status_Type, Codes, Save_Timer } from "../../scheme";

import { ByteTools, WebSocketBytesService } from "../../../web-socket.service";

import { StructType, ChangeState, ChangeInfo, ChangeTemplate } from "../settings";

import { SettingsService } from "../settings.service";

@Component({
  selector: 'app-group-types',
  templateUrl: './group-types.component.html',
  styleUrls: ['../settings.css', './group-types.component.css']
})
export class GroupTypesComponent extends ChangeTemplate<DIG_Type> implements OnInit
{

  codes: Codes[];

  constructor(
    wsbService: WebSocketBytesService,
    schemeService: SchemeService,
    private settingsService: SettingsService,
  ) {
    super(StructType.GroupTypes, wsbService, schemeService, DIG_Type);
  }

  getObjects(): DIG_Type[] {
    return this.schemeService.scheme.dig_type;
  }

  ngOnInit() {
    //this.fillItems();
    this.settingsService.getCodes().subscribe(codes => {
      this.codes = codes;
      this.fillItems();
    });
  }



  saveObject(obj: DIG_Type): Uint8Array {
    let name = ByteTools.saveQString(obj.name);
    let title = ByteTools.saveQString(obj.title);
    let desc = ByteTools.saveQString(obj.description);
    let view = new Uint8Array(8 + name.length + title.length + desc.length);
    ByteTools.saveInt32(obj.id, view);
    view.set(name, 4);
    view.set(title, 4 + name.length);
    view.set(desc, 4 + name.length + title.length);
    return view;
  }
}

@Component({
  selector: 'app-item-types',
  templateUrl: './item-types.component.html',
  styleUrls: ['../settings.css', './group-types.component.css']
})
export class ItemTypesComponent extends ChangeTemplate<Device_Item_Type> implements OnInit, OnChanges {
  @Input() grouptype: DIG_Type;

  signTypes: Sign_Type[];
  save_timers: Save_Timer[];

  constructor(
    wsbService: WebSocketBytesService,
    schemeService: SchemeService,
    private settingsService: SettingsService
  ) {
    super(StructType.DeviceItemTypes, wsbService, schemeService, Device_Item_Type);
  }

  ngOnChanges() {
    this.ngOnInit();
  }

  getObjects(): Device_Item_Type[] {
    return this.schemeService.scheme.device_item_type.filter(obj => obj.group_type_id === this.grouptype.id);
  }

  ngOnInit() {
    this.settingsService.getSaveTimers().subscribe(api => {
      this.save_timers = api.results;
      this.signTypes = this.schemeService.scheme.sign_type;
      this.fillItems();
    });
  }

  initItem(obj: Device_Item_Type): void {
    obj.name = '';
    obj.title = '';
    obj.group_type_id = this.grouptype.id;
  }

  saveObject(obj: Device_Item_Type): Uint8Array {
    let name = ByteTools.saveQString(obj.name);
    let title = ByteTools.saveQString(obj.title);
    let view = new Uint8Array(19 + name.length + title.length);
    let pos = 0;
    ByteTools.saveInt32(obj.id, view); pos += 4;
    view.set(name, pos); pos += name.length;
    view.set(title, pos); pos += title.length;
    ByteTools.saveInt32(obj.group_type_id, view, pos); pos += 4;
    ByteTools.saveInt32(obj.sign_id, view, pos); pos += 4;
    view[pos] = obj.register_type; pos += 1;
    view[pos] = obj.save_algorithm; pos += 1;
    ByteTools.saveInt32(obj.save_timer_id, view, pos); pos += 4;
    return view;
  }
}

@Component({
  selector: 'app-param-types',
  templateUrl: './param-types.component.html',
  styleUrls: ['../settings.css', './group-types.component.css']
})
export class ParamTypesComponent extends ChangeTemplate<DIG_Param_Type> implements OnInit {
  @Input() grouptype: DIG_Type;

  constructor(
    wsbService: WebSocketBytesService,
    schemeService: SchemeService,
  ) {
    super(StructType.GroupParamTypes, wsbService, schemeService, DIG_Param_Type);
  }

  getObjects(): DIG_Param_Type[] {
    return this.schemeService.scheme.dig_param_type.filter(obj => obj.group_type_id === this.grouptype.id);
  }

  ngOnInit() {
    this.fillItems();
  }

  initItem(obj: DIG_Param_Type): void {
    obj.name = '';
    obj.title = '';
    obj.group_type_id = this.grouptype.id;
  }

  saveObject(obj: DIG_Param_Type): Uint8Array {
    let name = ByteTools.saveQString(obj.name);
    let title = ByteTools.saveQString(obj.title);
    let desc = ByteTools.saveQString(obj.description);
    let view = new Uint8Array(13 + name.length + title.length + desc.length);
    let pos = 0;
    ByteTools.saveInt32(obj.id, view); pos += 4;
    view.set(name, pos); pos += name.length;
    view.set(title, pos); pos += title.length;
    view.set(desc, pos); pos += desc.length;
    view[pos] = obj.value_type; pos += 1;
    ByteTools.saveInt32(obj.group_type_id, view, pos); pos += 4;
    ByteTools.saveInt32(obj.parent_id, view, pos); pos += 4;
    return view;
  }
}

@Component({
  selector: 'app-statuses',
  templateUrl: './statuses.component.html',
  styleUrls: ['../settings.css', './group-types.component.css']
})
export class StatusesComponent extends ChangeTemplate<DIG_Status_Type> implements OnInit {
  @Input() grouptype: DIG_Type;

  constructor(
    wsbService: WebSocketBytesService,
    schemeService: SchemeService,
  ) {
    super(StructType.GroupStatusInfo, wsbService, schemeService, DIG_Status_Type);
  }

  getObjects(): DIG_Status_Type[] {
    return this.schemeService.scheme.dig_status_type.filter(obj => obj.group_type_id === this.grouptype.id);
  }

  ngOnInit() {
    this.fillItems();
  }

  initItem(obj: DIG_Status_Type): void {
    obj.name = '';
    obj.group_type_id = this.grouptype.id;
  }

  saveObject(obj: DIG_Status_Type): Uint8Array {
    let name = ByteTools.saveQString(obj.name);
    let title = ByteTools.saveQString(obj.text);
    let view = new Uint8Array(13 + name.length + title.length);
    let pos = 0;
    ByteTools.saveInt32(obj.id, view); pos += 4;
    view.set(name, pos); pos += name.length;
    view.set(title, pos); pos += title.length;
    ByteTools.saveInt32(obj.category_id, view, pos); pos += 4;
    ByteTools.saveInt32(obj.group_type_id, view, pos); pos += 4;
    view[pos] = obj.inform ? 1 : 0; pos += 1;
    return view;
  }
}

// Deprecated
export class OtherTypesComponent implements OnInit {
  paramItems: DIG_Param_Type[];
  itemTypes: Device_Item_Type[];
  groupTypes: DIG_Type[];
  statuses: DIG_Status_Type[];

  status: DIG_Status_Type;
  param: DIG_Param_Type;
  sel_itype: Device_Item_Type;
  sel_gtype: DIG_Type;

  constructor(
    private schemeService: SchemeService,
  ) {}

  ngOnInit() {
    this.paramItems = this.schemeService.scheme.dig_param_type;
    this.groupTypes = this.schemeService.scheme.dig_type;
    this.statuses = [];
  }

  select(gtype: DIG_Type): void {
    if (this.sel_gtype == gtype) {
      this.sel_gtype = undefined;
      this.sel_itype = undefined;
    } else {
      this.sel_gtype = gtype;

      this.itemTypes = [];
      let itemTypes = this.schemeService.scheme.device_item_type;
      for (let itype of itemTypes)
        if (itype.group_type_id == this.sel_gtype.id)
          this.itemTypes.push(itype);
    }
  }

  remove(gtype: DIG_Type): void {
    // Dialog
  }

  add(): void {
    this.sel_gtype = new DIG_Type();
    this.sel_gtype.id = 0;
    this.groupTypes.push(this.sel_gtype);
  }

  save(): void {
    this.sel_gtype.name = this.sel_gtype.name.trim();
    if (!this.sel_gtype.name) return;
  }

  select_it(itype: Device_Item_Type): void {
    this.sel_itype = this.sel_itype == itype ? undefined : itype;
  }

  remove_it(itype: Device_Item_Type): void {
    // Dialog
  }

  add_it(): void {
    this.sel_itype = new Device_Item_Type();
    this.sel_itype.id = 0;
    this.sel_itype.title = '';
    this.sel_itype.group_type_id = this.sel_gtype.id;
    this.itemTypes.push(this.sel_itype);
  }

  save_it(): void {
    this.sel_itype.name = this.sel_itype.name.trim();
    if (!this.sel_itype.name) return;
  }

  select_param(param: DIG_Param_Type): void {
    this.param = this.param == param ? undefined : param;
  }

  remove_param(param: DIG_Param_Type): void {
    // Dialog
  }

  add_param(): void {
    this.param = new DIG_Param_Type();
    this.param.id = 0;
    this.paramItems.push(this.param);
  }

  save_param(): void {
    this.param.name = this.param.name.trim();
    if (!this.param.name) return;
  }

  select_status(status: DIG_Status_Type): void {
    this.status = this.status == status ? undefined : status;
  }

  remove_status(status: DIG_Status_Type): void {
    // Dialog
  }

  add_status(): void {
    this.status = new DIG_Status_Type();
    this.status.id = 0;
    this.statuses.push(this.status);
  }

  save_status(): void {
    this.status.name = this.status.name.trim();
    if (!this.status.name) return;
  }
}
