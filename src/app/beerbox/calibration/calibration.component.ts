import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

import { Section, DeviceItem, ParamValue } from "../../house/house";
import { HouseService } from "../../house/house.service";
import { ControlService } from "../../house/control.service"

@Component({
  selector: 'app-calibration',
  templateUrl: './calibration.component.html',
  styleUrls: ['../../sections.css', './calibration.component.css']
})

export class CalibrationComponent implements OnInit
{
  @Input() empty_bottle_mass_: string[];
  @Input() full_bottle_mass_: string[];
  items: any[];
  step_: number[];

  constructor(
    private route: ActivatedRoute,
    private houseService: HouseService,
    private controlService: ControlService
  ) { }

  ngOnInit() 
  {
    this.getSections();
  }

  getSections(): void 
  {
    let items: any[] = [];
    let is_first: boolean = true;
    for (let sct of this.houseService.house.sections) 
	  {
      if (is_first) 
	    {
        is_first = false;
        continue;
      }
      let it: any = { sct };
      for (let group of sct.groups) 
	    {
        if (group.type.name == 'head') 
		    { // api.HeadGroup
          for (let item of group.items) 
		      {
            switch(item.type.name) 
			      {
              case 'pouring':  it.pouring = item;    break; // api.type.item.pouring
              case 'volume':  it.volume = item; break; // api.type.item.volume
              case 'pause':  it.pause = item;      break; // api.type.item.pause
            }

            if (it.pouring !== undefined && it.volume !== undefined && it.pause !== undefined)
			      {
              break;
			      }
          }
        } 
        else if (group.type.name == 'cleanTakehead') 
        {
          for (let item of group.items) 
          {
            switch(item.type.name) 
            {
              case 'cleanType': it.clean_type = item;              break; // api.CleanTypeItem
            }

            if (it.clean_type !== undefined)
            {
              break;
            }
          }
        }
        else if (group.type.name == 'params') 
        { // api.type.group.params
          for (let item of group.items) 
          {
            if (item.type.name == 'setVol3')
            { // api.type.item.setVol3
              it.full_volume = item;
            }
          }
          for (let param of group.params)
          {
            if (param.param.name == "ratioVolume")
            {
              it.ratio_volume_param = param;
              break;
            }
          }
        }
      }
      if (it.ratio_volume_param !== undefined && it.pouring !== undefined && it.volume !== undefined && it.pause !== undefined && it.full_volume !== undefined)
	    {
        items.push(it);
	    }
    }

    this.items = items;
    this.empty_bottle_mass_ = new Array(items.length);
    this.full_bottle_mass_ = new Array(items.length);
    this.step_ = new Array(items.length).fill(0);
  }
	
  click_next(index: number): void
  {	  
    switch(this.step_[index])
    {
      case 0:
        if (+this.empty_bottle_mass_[index] > 0)
        {
          this.step_[index] = this.step_[index] + 1;
        }	      
        break;
      case 1:
        if (+this.full_bottle_mass_[index] > 0 && +this.full_bottle_mass_[index] > +this.empty_bottle_mass_[index])
        {
          this.calculate_coeff(index);
          this.step_[index] = this.step_[index] + 1;			
        }
        break;			  
    }	  
  }  

  calculate_coeff(index: number): void
  {			  
    if (this.items[index].ratio_volume_param != undefined)
    {
      let result_coeff: number = 0.;

      result_coeff = (+this.items[index].ratio_volume_param.value) * (+this.items[index].full_volume.val.display) * 1.03 / ((+this.full_bottle_mass_[index]) - (+this.empty_bottle_mass_[index]));	

      this.items[index].ratio_volume_param.value = result_coeff.toString();	

      let params: ParamValue[] = [];
      params.push(this.items[index].ratio_volume_param);
      this.controlService.changeParamValues(params);
    }
  }
	
  click_restart(index: number): void
  {
    this.empty_bottle_mass_[index] = "";
    this.full_bottle_mass_[index] = "";
    this.step_[index] = 0;
  }
	
  check_number_only(event): boolean 
  {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) 
	  {
      return false;
    }
    return true;
  }

}
