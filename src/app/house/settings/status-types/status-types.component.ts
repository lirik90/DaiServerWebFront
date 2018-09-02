import { Component, OnInit } from '@angular/core';

import { HouseService } from "../../house.service";
import { StatusType } from "../../house";

@Component({
  selector: 'app-status-types',
  templateUrl: './status-types.component.html',
  styleUrls: ['../../../houses/list/list.component.css', './status-types.component.css']
})
export class StatusTypesComponent implements OnInit {
  statusTypes: StatusType[];
  stype: StatusType;

  constructor(
    private houseService: HouseService,
  ) {}

  ngOnInit() {
    this.statusTypes = []; //this.houseService.house.statusTypes;
  }

  select(stype: StatusType): void {
    this.stype = this.stype == stype ? undefined : stype;
  }
  
  remove(stype: StatusType): void {
    // Dialog
  }

  add(): void {
    this.stype = new StatusType();
    this.stype.id = 0;
    this.statusTypes.push(this.stype);
  }

  save(): void {
    this.stype.name = this.stype.name.trim();
    if (!this.stype.name) return;
  }
}
