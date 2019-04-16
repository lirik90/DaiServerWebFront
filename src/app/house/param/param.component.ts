import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { Location } from '@angular/common';

import { AuthenticationService } from "../../authentication.service";
import { HouseService } from "../house.service";
import { ControlService } from "../control.service";
import { Group, ParamType, ParamValue } from '../house';

interface Param_Item
{
  param_: ParamValue;
  has_childs_: boolean;
  childs_params_: Param_Item[];
}

@Component({
  selector: 'app-param',
  templateUrl: './param.component.html',
  styleUrls: ['./param.component.css']
})

export class ParamComponent implements OnInit 
{
  group: Group = undefined;
  cantChange: boolean;
  public paramTypes = ParamType;   
  
  params_: Param_Item[];

  constructor(
    private route: ActivatedRoute,
    private houseService: HouseService,
    private authService: AuthenticationService,
    private controlService: ControlService,
    private location: Location
  ) { }

  ngOnInit() {
    this.getGroup();
    console.log(this.group.params);
    this.cantChange = !this.authService.canChangeParam();
  }

  canShowIt(param_type: number): boolean {
    return param_type !== ParamType.RangeType;
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
          this.group = group;
          this.getGroupParams(this.params_);
          return;
        }
      }
    }
  }
  
  getGroupParams(item: Param_Item[]): void
  {
    /*for (let param of this.group)
    {
      if (param.type == ParamType.Unknown)
      {
        if (param.childs !== undefined)
        {
          //todo parent parameter
        }
      }
      else
      {
        if (param.parent_id == null)
        {
          let has_childs
          item.push({param_: param, has_childs_: has_childs, })
        }
      }
    }*/
  }

  getTimeString(p: ParamValue): string {
    let pad = (val: number) => {
      return ('0' + val.toFixed(0)).slice(-2);
    };
    let secs = parseInt(p.value);
    let h = pad(secs / 3600);
    secs %= 3600;
    let m = pad(secs / 60);
    return h + ':' + m + ':' + pad(secs % 60);
  }

  setTimeParam(p: ParamValue, val: string): void {
    let arr = val.split(':').reverse();
    if (!arr.length) return;

    let new_value = parseInt(arr[0]);
    if (arr.length > 1) new_value += parseInt(arr[1]) * 60;
    if (arr.length > 2) new_value += parseInt(arr[2]) * 3600;
    p.value = new_value.toString();
  }

  onSubmit() 
  {
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
