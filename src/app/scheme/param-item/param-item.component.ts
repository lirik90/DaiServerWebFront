import { Component, OnInit, Input } from '@angular/core';
import { DIG_Param_Value, DIG_Param_Type, DIG_Param_Value_Type } from "../scheme";

@Component({
  selector: 'app-param-item',
  templateUrl: './param-item.component.html',
  styleUrls: ['./param-item.component.css']
})
export class ParamItemComponent implements OnInit {

  @Input() values: DIG_Param_Value[];
  @Input() changed: DIG_Param_Value[];
  @Input() parent_param: DIG_Param_Type = null;

  value_type = DIG_Param_Value_Type;   

  constructor() { }

  ngOnInit() {
  }

  getTimeString(p: DIG_Param_Value): string 
  {
    let pad = (val: number) => {
      return ('0' + val.toFixed(0)).slice(-2);
    };
    let secs = parseInt(p.value);
    let h = pad(secs / 3600);
    secs %= 3600;
    let m = pad(secs / 60);
    return h + ':' + m + ':' + pad(secs % 60);
  }

  setTimeParam(p: DIG_Param_Value, val: string): void 
  {
    let arr = val.split(':').reverse();
    if (!arr.length) return;

    let new_value = parseInt(arr[0]);
    if (arr.length > 1) new_value += parseInt(arr[1]) * 60;
    if (arr.length > 2) new_value += parseInt(arr[2]) * 3600;
    p.value = new_value.toString();
  }

  change(item: DIG_Param_Value, new_value: any): void
  {
    for (let param_value of this.changed)
    {
      if (param_value.id === item.id)
      {
        if (param_value.param.value_type === DIG_Param_Value_Type.VT_TIME)          
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
    this.changed.push(item);
  }


}
