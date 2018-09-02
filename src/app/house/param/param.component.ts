import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { Location } from '@angular/common';

import { AuthenticationService } from "../../authentication.service";
import { HouseService } from "../house.service";
import { ControlService } from "../control.service";
import { Group, ParamType, ParamValue } from '../house';

@Component({
  selector: 'app-param',
  templateUrl: './param.component.html',
  styleUrls: ['./param.component.css']
})
export class ParamComponent implements OnInit {
  houseId: number;
  group: Group;

  cantChange: boolean;

  public paramTypes = ParamType;

  constructor(
    private route: ActivatedRoute,
    private houseService: HouseService,
    private authService: AuthenticationService,
    private controlService: ControlService,
    private location: Location
  ) { }

  ngOnInit() {
    this.houseId = this.houseService.house.id;
    this.getGroupParams();
    this.cantChange = !this.authService.canChangeParam();
  }

  canShowIt(param_type: number): boolean {
    return param_type !== ParamType.RangeType;
  }

  getGroupParams(): void {
    const groupId = +this.route.snapshot.paramMap.get('groupId');
    for (let sct of this.houseService.house.sections) {
      for (let group of sct.groups) {
        if (group.id === groupId) {
          this.group = group;
          return;
        }
      }
    }
  }

  onSubmit() {
    let params: ParamValue[] = [];
    for (const data of this.group.params)
      if (this.canShowIt(data.param.type))
        params.push(data);
    this.controlService.changeParamValues(params);
    this.goBack();
  }

  goBack(): void {
    this.location.back();
  }
}
