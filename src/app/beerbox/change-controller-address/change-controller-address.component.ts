import { Component, OnInit } from '@angular/core';

import { Section, DeviceItem, ParamValue } from "../../house/house";
import { HouseService } from "../../house/house.service";
import { ControlService } from "../../house/control.service"

@Component({
  selector: 'app-change-controller-address',
  templateUrl: './change-controller-address.component.html',
  styleUrls: ['../../sections.css', './change-controller-address.component.css']
})

export class ChangeControllerAddressComponent implements OnInit 
{
  items_: any = {};
  
  get items(): any
  {
    return this.items_;
  }
  
  address_: number = 0;
  speed_: number = 0;
  is_writing_: boolean = false;
  
  constructor(
    private houseService: HouseService,
    private controlService: ControlService) { }

  ngOnInit()
  {
    this.get_info();    
  }
  
  get_info(): void
  {
    console.log(this.houseService.house.devices);
    for (let device of this.houseService.house.devices)
    {
      if (device.address == 247)
      {
        for (let item of device.items)
        {
          switch(item.type.name) 
          {
            case 'change_controller_address':  this.items_.change_controller_address = item;    break;
            case 'controller_address_1':  this.items_.controller_address_1 = item;    break;
            case 'controller_address_2':  this.items_.controller_address_2 = item;    break;
          }
        }
        break
      }
    }
  }
  
  click_start_button(): void
  {
    if (this.items.change_controller_address.value == 0)
    {
      this.is_writing_ = false;
      this.address_ = 0;
      this.speed_ = 0;
      this.controlService.writeToDevItem(this.items.change_controller_address.id, 1);
    }
    else
    {
      this.controlService.writeToDevItem(this.items.change_controller_address.id, 0);
    }    
  }
  
  click_write_button(): void
  {
    this.is_writing_ = true;
    
    let holding_register_1: number = 0;
    let holding_register_2: number = 0;
    
    holding_register_1 = this.address_ | ((this.speed_ >> 8) & 0xff00);
    holding_register_2 = this.speed_ & 0xffff;
    
    this.controlService.writeToDevItem(this.items.controller_address_1.id, holding_register_1);
    this.controlService.writeToDevItem(this.items.controller_address_2.id, holding_register_2);        
    
    /*console.log(holding_register_1);
    console.log(holding_register_2);
    
    this.address_ = holding_register_1 & 0xff
    this.speed_ = ((holding_register_1 << 8) & 0xff0000) | holding_register_2;
    
    console.log(this.address_);
    console.log(this.speed_);*/
    
  }
  
  is_address_writed(): boolean
  {
    if (this.items_.controller_address_1 != undefined && this.items_.controller_address_2 != undefined)
    {
      let address = this.items_.controller_address_1.raw_value & 0xff
      let speed = ((this.items_.controller_address_1.raw_value << 8) & 0xff0000) | this.items_.controller_address_2.raw_value;
    
      let res = (address == this.address_) && (speed == this.speed_);
      if (res)
      {
        this.is_writing_ = false;
      }
      return res;
    }
    return false;
  }
  
  is_controller_connected(): boolean
  {
    if (this.items.controller_address_1.raw_value == undefined)
    {
      this.address_ = 0;
      this.speed_ = 0;
      return false;
    }
    return true;
  }

}
