import { Component, OnInit } from '@angular/core';

import { HouseService } from "../../house.service";
import { ItemType, SignType, GroupType, ParamItem, Status } from "../../house";

@Component({
  selector: 'app-group-types',
  templateUrl: './group-types.component.html',
  styleUrls: ['../../../houses/list/list.component.css', './group-types.component.css']
})
export class GroupTypesComponent implements OnInit {
  signTypes: SignType[];
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
    this.signTypes = this.houseService.house.signTypes;
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
