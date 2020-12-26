import { Component, OnInit, Input } from '@angular/core';

import { SchemeService } from "../scheme.service";
import { DIG_Param, DIG_Param_Type, DIG_Param_Value_Type } from "../scheme";

@Component({
  selector: 'app-param-item',
  templateUrl: './param-item.component.html',
  styleUrls: ['./param-item.component.css']
})
export class ParamItemComponent implements OnInit {

  @Input() values: DIG_Param[];
  @Input() changed: DIG_Param[];
  @Input() parent_param: DIG_Param_Type = null;

  value_type = DIG_Param_Value_Type;

  constructor(
      private schemeService: SchemeService
  ) { }

  ngOnInit() {
  }

    isDisabled(p: DIG_Param): boolean
    {
        return this.schemeService.scheme.disabled_param.includes(p.param_id);
    }

  getTimeString(p: DIG_Param): string
  {
    let pad = (val: number) => {
      return ('0' + val.toFixed(0)).slice(-2);
    };
    let secs = parseInt(p.value);
    let h = pad(Math.floor(secs / 3600));
    secs %= 3600;
    let m = pad(Math.floor(secs / 60));
    return h + ':' + m + ':' + pad(secs % 60);
  }

  setTimeParam(p: DIG_Param, val: string): void
  {
      let arr = val.split(':');
      if (arr.length)
      {
          let v = parseInt(arr[0]) * 3600;
          let new_value = !Number.isNaN(v) ? v : 0;

          if (arr.length > 1) v = parseInt(arr[1]) * 60;
          new_value += !Number.isNaN(v) ? v : 0;

          if (arr.length > 2) v = parseInt(arr[2]);
          new_value += !Number.isNaN(v) ? v : 0;

          p.value = new_value.toString();
      }
  }

  change(item: DIG_Param, new_value: any): void
  {
    for (let param_value of this.changed)
    {
      if (param_value.id === item.id)
      {
        if (param_value.param.value_type === DIG_Param_Value_Type.VT_TIME)
          this.setTimeParam(param_value, new_value);
        else if (param_value.value !== new_value)
          param_value.value = new_value;
        return;
      }
    }

    const copy = {...item};
    if (item.param.value_type === DIG_Param_Value_Type.VT_TIME)
      this.setTimeParam(copy, new_value);
    else if (copy.value !== new_value)
      copy.value = new_value;

    this.changed.push(copy);
  }
}
