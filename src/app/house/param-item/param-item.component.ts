import { Component, OnInit, Input } from '@angular/core';
import { ParamValue, ParamItem, ParamType } from "../house";

@Component({
  selector: 'app-param-item',
  templateUrl: './param-item.component.html',
  styleUrls: ['./param-item.component.css']
})
export class ParamItemComponent implements OnInit {

  @Input() values: ParamValue[];
  @Input() changed: ParamValue[];
  @Input() parent_param: ParamItem = null;

  paramTypes = ParamType;   

  constructor() { }

  ngOnInit() {
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
    for (let param_value of this.changed)
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
    this.changed.push(item);
  }


}
