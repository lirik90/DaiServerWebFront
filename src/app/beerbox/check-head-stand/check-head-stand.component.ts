import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

import { Section, DeviceItem } from "../../house/house";
import { HouseService } from "../../house/house.service";
import { ControlService } from "../../house/control.service";

@Component({
  selector: 'app-check-head-stand',
  templateUrl: './check-head-stand.component.html',
  styleUrls: ['../../sections.css', './check-head-stand.component.css']
})

export class CheckHeadStandComponent implements OnInit
{
  volume_input: any;
  items: any[];
  params: any;

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
        let current_device: any = {};
        for (let group of sct.groups) 
        {          
          if (group.type.id == 20) 
          {            
            for (let param of group.params) 
            {         
              switch(param.param.name)
              {
                case "check_head_fill_water_volume": current_device.check_head_fill_water_volume = param; break;
                case "check_head_wash_volume": current_device.check_head_wash_volume = param; break;
              }
              if (current_device.check_head_fill_water_volume !== undefined && current_device.check_head_wash_volume !== undefined)
              {
                break; 
              }
            }
            break;
          }
        }
        this.params = current_device;
        is_first = false;
      }
      else
      {
        let current: any = { sct };
        for (let group of sct.groups) 
        {
          if (group.type.id == 16) 
          { // api.HeadGroup
            for (let item of group.items) 
            {
              switch(item.type.id) 
              {
                case 62:  current.pouring = item;    break; // api.PouringItem
                case 105: current.step = item;       break; // api.CleanStepItem
                case 71:  current.cur_volume = item; break; // api.type.item.volume
                case 99:  current.pause = item;      break; // api.type.item.pause
                case 70:  current.block_pouring = item; break;              
                case 102: current.clean_type = item; break;
              }

              if (current.pouring !== undefined && current.step !== undefined && current.cur_volume !== undefined && current.pause !== undefined && current.clean_type !== undefined && current.block_pouring !== undefined)
              {
                break;
              }
            }
          } 
          else if (group.type.id == 17) 
          { // api.type.group.params
            for (let item of group.items) 
            {
              if (item.type.id == 96)
              { // api.type.item.setVol3
                current.full_volume = item;
              }
            }
          }
        }
        if (current.pouring !== undefined && current.step !== undefined && current.cur_volume !== undefined && current.pause !== undefined && current.clean_type !== undefined && current.block_pouring !== undefined && current.full_volume !== undefined)
        {
          if (current.pouring.value != null)
          {
            items.push(current);
            this.volume_input = current.clean_type.raw_value == 11 ? this.params.check_head_fill_water_volume.value : this.params.check_head_wash_volume.value;
          }
        }  
      }            
    }

    this.items = items;
  }
	
  click_start_check_button(item: any, type: number): void
  {    
	  this.controlService.writeToDevItem(item.clean_type.id, type);
    switch (type)
    {
      case 11: this.volume_input = this.params.check_head_fill_water_volume.value; break;
      case 13: this.volume_input = this.params.check_head_wash_volume.value; break;
    }
  }
  
  click_apply_button(item: any): void
  {
    console.log(this.volume_input);
    let params: ParamValue[] = [];
    switch(+item.clean_type.raw_value) 
    {
      case 11:
        this.params.check_head_fill_water_volume.value = this.volume_input;
        params.push(this.params.check_head_fill_water_volume);
        break;
      case 13:
        this.params.check_head_wash_volume.value = this.volume_input;
        params.push(this.params.check_head_wash_volume);
        break;
      default:
        return;
    }    
    this.controlService.changeParamValues(params);
  }
  
  click_cancel_check_button(item: any): void
  {
    this.controlService.writeToDevItem(item.clean_type.id, 0);
  }
  
  click_stop_check_button(item: any): void
  {
    this.controlService.writeToDevItem(item.block_pouring.id, 1);
    //this.controlService.writeToDevItem(item.clean_type.id, 0);
  }
  
  get_type_text(item: any): string 
  {
    switch(+item.clean_type.raw_value) 
    {
      case 11: return "Наполнение магистрали водой - налив 100 мл со второй кеги (вода)";
      case 12: return "Проверка - обычный налив пива с настройкой по умолчанию с первой кеги (пиво)";
      case 13: return "Промывка - налив 300 мл воды.";
    }
    return "";
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
