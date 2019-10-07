import {Component, Input, OnInit} from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { Location } from '@angular/common';

import { AuthenticationService } from "../../authentication.service";
import { HouseService } from "../house.service";
import { ControlService } from "../control.service";
import { Group, ParamValue, Section } from '../house';

@Component({
  selector: 'app-param',
  templateUrl: './param.component.html',
  styleUrls: ['./param.component.css']
})
export class ParamComponent implements OnInit
{
  sct: Section;
  group: Group = undefined;
  cantChange: boolean;

  changed_values: ParamValue[] = [];

  @Input() groupId;

  constructor(
    private route: ActivatedRoute,
    private houseService: HouseService,
    private authService: AuthenticationService,
    private controlService: ControlService,
    private location: Location
  ) { }

  ngOnInit() {
    if (!this.groupId) {
      this.getGroup();
    }
    this.cantChange = !this.authService.canChangeParam();
  }

  getGroup(): void
  {
    const groupId = +this.route.snapshot.paramMap.get('groupId');
    for (let sct of this.houseService.house.sections)
    {
      for (let group of sct.groups)
      {
        if (group.id === groupId)
        {
          this.sct = sct;
          this.group = group;
          return;
        }
      }
    }
  }

  onSubmit()
  {
    console.log(this.changed_values);
    if (this.changed_values)
      this.controlService.changeParamValues(this.changed_values);
    this.goBack();
  }

  goBack(): void {
    console.log('BACK!');
    this.location.back();
  }
}
