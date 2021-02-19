import { Input, Component, OnInit } from '@angular/core';

import { SchemeService } from "../../scheme.service";
import { Section, Device_Item_Group, DIG_Type, DIG_Param_Type, DIG_Param } from "../../scheme";
import { SettingsService } from "../../settings.service";
import { ChangeState, ChangeInfo, ChangeTemplate } from "../settings";

@Component({
  selector: 'app-sections',
  templateUrl: './sections.component.html',
  styleUrls: ['../settings.css', './sections.component.css']
})
export class SectionsComponent extends ChangeTemplate<Section> implements OnInit {
  constructor(
    schemeService: SchemeService,
    private settingsService: SettingsService,
  ) {
    super(schemeService, Section, 'section');
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
    schemeService: SchemeService,
  ) {
    super(schemeService, Device_Item_Group, 'device_item_group');
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
}

@Component({
  selector: 'app-params-in-group',
  templateUrl: './params-in-group.component.html',
  styleUrls: ['../settings.css', './sections.component.css']
})
export class ParamsInGroupComponent extends ChangeTemplate<DIG_Param> implements OnInit
{
  @Input() group: Device_Item_Group;

  params: DIG_Param_Type[];

  constructor(
    schemeService: SchemeService,
  ) {
    super(schemeService, DIG_Param, 'dig_param');
  }

  getObjects(): DIG_Param[]
  {
    return this.group.params;
  }

  ngOnInit()
  {
    this.fillItems();
    this.params = this.schemeService.scheme.dig_param_type.filter(obj => obj.group_type_id === this.group.type_id);
  }

  initItem(obj: DIG_Param): void
  {
    obj.param = new DIG_Param_Type();
    obj.group_id = this.group.id;
  }
}

