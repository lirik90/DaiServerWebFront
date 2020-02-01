import { Input, Component, OnInit } from '@angular/core';

import { SchemeService } from "../../scheme.service";
import { Section, Device_Item_Group, DIG_Type, DIG_Param_Type, DIG_Param_Value } from "../../scheme";
import { ByteTools, WebSocketBytesService } from "../../../web-socket.service";
import { SettingsService } from "../settings.service";
import { StructType, ChangeState, ChangeInfo, ChangeTemplate } from "../settings";

@Component({
  selector: 'app-sections',
  templateUrl: './sections.component.html',
  styleUrls: ['../settings.css', './sections.component.css']
})
export class SectionsComponent extends ChangeTemplate<Section> implements OnInit {
  constructor(
    wsbService: WebSocketBytesService,
    schemeService: SchemeService,
    private settingsService: SettingsService,
  ) {
    super(StructType.Sections, wsbService, schemeService, Section);
  }

  getObjects(): Section[] {
    return this.schemeService.scheme.section;
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
    ByteTools.saveInt32(obj.id, view);
    view.set(name, 4);
    ByteTools.saveInt32(obj.day_start, view, 4 + name.length);
    ByteTools.saveInt32(obj.day_end, view, 8 + name.length);
    return view;
  }
}

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['../settings.css', './sections.component.css']
})
export class GroupsComponent extends ChangeTemplate<Device_Item_Group> implements OnInit {
  @Input() sct: Section;

  groupTypes: DIG_Type[];

  constructor(
    wsbService: WebSocketBytesService,
    schemeService: SchemeService,
  ) {
    super(StructType.Groups, wsbService, schemeService, Device_Item_Group);
  }

  getObjects(): Device_Item_Group[] {
    return this.sct.groups;
  }

  ngOnInit() {
    this.groupTypes = this.schemeService.scheme.dig_type;
    this.fillItems();
  }

  title(item: Device_Item_Group = undefined): string 
  {
    if (item === undefined)
    {
      item = this.sel_item.obj;
    }
    return item.title ? item.title : (item.type ? item.type.title : '');
  }

  initItem(obj: Device_Item_Group): void 
  {
    obj.section_id = this.sct.id;
  }

  saveObject(obj: Device_Item_Group): Uint8Array 
  {
    let title = ByteTools.saveQString(obj.title);
    let view = new Uint8Array(12 + title.length);
    let pos = 0;

    obj.section_id = this.sct.id;
    console.log(obj.section_id);
    console.log(this.sct);
    ByteTools.saveInt32(obj.id, view, pos); pos += 4;
    view.set(title, pos); pos += title.length;
    ByteTools.saveInt32(obj.section_id, view, pos); pos += 4;
    ByteTools.saveInt32(obj.type_id, view, pos); pos += 4;
    return view;
  }
}

@Component({
  selector: 'app-params-in-group',
  templateUrl: './params-in-group.component.html',
  styleUrls: ['../settings.css', './sections.component.css']
})
export class ParamsInGroupComponent extends ChangeTemplate<DIG_Param_Value> implements OnInit 
{
  @Input() group: Device_Item_Group;
  
  params: DIG_Param_Type[];

  constructor(
    wsbService: WebSocketBytesService,
    schemeService: SchemeService,
  ) {
    super(StructType.Group_Param, wsbService, schemeService, DIG_Param_Value);
  }

  getObjects(): DIG_Param_Value[] 
  { 
    return this.group.params;
  }

  ngOnInit() 
  {
    this.fillItems();
    this.params = this.schemeService.scheme.dig_param_type.filter(obj => obj.group_type_id === this.group.type_id);
  }

  initItem(obj: DIG_Param_Value): void 
  {
    obj.param = new DIG_Param_Type();
    obj.group_id = this.group.id;
  }

  saveObject(obj: DIG_Param_Value): Uint8Array 
  {
    console.log(obj);
    let view = new Uint8Array(16);
    let pos = 0;
    ByteTools.saveInt32(obj.id, view); pos += 4;
    ByteTools.saveInt32(obj.param.id, view, pos); pos += 4;
    ByteTools.saveInt32(obj.group_id, view, pos); pos += 4;
    ByteTools.saveInt32(0, view, pos); pos += 4;
    return view;
  }
}

