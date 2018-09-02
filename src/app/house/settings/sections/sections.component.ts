import { Component, OnInit } from '@angular/core';

import { HouseService } from "../../house.service";
import { Section, Group, GroupType } from "../../house";
import { SettingsService } from "../settings.service";

@Component({
  selector: 'app-sections',
  templateUrl: './sections.component.html',
  styleUrls: ['../../../houses/list/list.component.css', './sections.component.css']
})
export class SectionsComponent implements OnInit {
  groupTypes: GroupType[];
  sections: Section[];
  sel_sct: Section;
  sel_group: Group;

  constructor(
    private houseService: HouseService,
    private settingsService: SettingsService,
  ) { }

  ngOnInit() {
    this.sections = this.houseService.house.sections;
    this.groupTypes = this.houseService.house.groupTypes;
  }

  select(sct: Section): void {
    if (this.sel_sct == sct) {
      this.sel_sct = undefined;
      this.sel_group = undefined;
    } else
      this.sel_sct = sct;
  }
  
  remove(sct: Section): void {
    // Dialog
    this.sections = this.sections.filter(s => s !== sct);
    this.settingsService.deleteSection(sct).subscribe(_ => {
      // this.controlService.deleteSection(sct);
    });
  }

  add(): void {
    this.sel_sct = new Section();
    this.sel_sct.id = 0;
    this.sections.push(this.sel_sct);
  }

  save(): void {
    this.sel_sct.name = this.sel_sct.name.trim();
    if (!this.sel_sct.name) return;
  }

  select_group(group: Group): void {
    this.sel_group = this.sel_group == group ? undefined : group;
  }
  
  remove_group(group: Group): void {
    // Dialog
  }

  add_group(): void {
    this.sel_group = new Group();
    this.sel_group.id = 0;
    this.sel_group.section_id = this.sel_sct.id;
    this.sel_sct.groups.push(this.sel_group);
  }

  save_group(): void {
  }
}
