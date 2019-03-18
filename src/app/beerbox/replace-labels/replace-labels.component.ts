import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

import { Section, DeviceItem, ParamValue } from "../../house/house";
import { HouseService } from "../../house/house.service";
import { ControlService } from "../../house/control.service"


@Component({
  selector: 'app-replace-labels',
  templateUrl: './replace-labels.component.html',
  styleUrls: ['../../sections.css', './replace-labels.component.css']
})
export class ReplaceLabelsComponent implements OnInit 
{

  is_changed_ = false;
  labels_num_full_: any;
  labels_handle_: any;
  
  constructor(
    private route: ActivatedRoute,
    private houseService: HouseService,
    private controlService: ControlService) { }

  ngOnInit() 
  {
    this.get_info();
  }
  
  get_info(): void
  {
    for (let sct of this.houseService.house.sections) 
	  {
      if (sct.id == 1)
      {
        for (let group of sct.groups)
        {
          if (group.type.name == "label")
          {            
            for (let item of group.items)
            {
              if (item.type.name == "change_tape")
              {
                this.labels_handle_ = item;
              }
            }
            
            for (let param of group.params)
            {
              if (param.param.name == "labels_num_full")
              {
                this.labels_num_full_ = param;
                this.labels_num_full_.value = +this.labels_num_full_.value + 10;
              }
            }            
          }
        }        
      }      
    }
  }
  
  click_apply_button(): void
  {    
    if (this.labels_num_full_.value > 10)
    {
      this.is_changed_ = true;
      let params: ParamValue[] = [];
      this.labels_num_full_.value = +this.labels_num_full_.value - 10;
      params.push(this.labels_num_full_);
      this.controlService.changeParamValues(params);      
      this.controlService.writeToDevItem(this.labels_handle_.id, 1);
      
      this.labels_num_full_.value = +this.labels_num_full_.value + 10;
    }
  }

}
