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
  childs_params_: ParamValue[];
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
  
  params_: Param_Item[] = [];
  changed_values: ParamValue[] = [];

  constructor(
    private route: ActivatedRoute,
    private houseService: HouseService,
    private authService: AuthenticationService,
    private controlService: ControlService,
    private location: Location
  ) { }

  ngOnInit() {
    this.getGroup();
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
          this.group = group;
          this.getGroupParams(this.params_);
          return;
        }
      }
    }    
  }
  
  getGroupParams(param_items: Param_Item[]): void
  {    
    for (let item of this.group.params)
    {
      if (item.param.type == ParamType.Unknown || item.param.type == ParamType.RangeType)
      {
        if (item.param.childs !== undefined)
        {
          let childs_params: ParamValue[] = [];
          for (let item2 of this.group.params)
          {
            if (item2.param.parent_id == item.param.id)
            {              
              childs_params.push(item2);
            }
          }
          param_items.push({param_: item, has_childs_: true, childs_params_: childs_params});
        }
      }
      else
      {
        if (item.param.parent_id == null)
        {
          param_items.push({param_: item, has_childs_: false, childs_params_:[]});
        }
      }
    }
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

  change(item: ParamValue, new_value: any): void
  {
    for (let param_value of this.changed_values)
    {
      if (param_value.id === item.id)
      {
        if (param_value.param.type === ParamType.TimeType)
        {
          this.setTimeParam(param_value, new_value);
        }
        else if (param_value.value !== new_value)
        {
          param_value.value = new_value;
        }
        return;
      }
    }

    item.value = new_value;
    this.changed_values.push(item);
  }

  onSubmit() 
  {
    if (this.changed_values)
      this.controlService.changeParamValues(this.changed_values);
    this.goBack();
  }

  goBack(): void {
    this.location.back();
  }
}
