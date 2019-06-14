import { Component, OnInit, Input, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ActivatedRoute } from "@angular/router";
import { timer } from 'rxjs';

import { Section, DeviceItem, ParamValue } from "../../house/house";
import { HouseService } from "../../house/house.service";
import { ControlService } from "../../house/control.service";

@Component({
  selector: 'app-check-head-stand',
  templateUrl: './check-head-stand.component.html',
  styleUrls: ['../../sections.css', './check-head-stand.component.css']
})

export class CheckHeadStandComponent implements OnInit
{
  is_canceling_: boolean;
  items: any[];
  is_clamp_: boolean;
  is_releasing_: boolean;
  
  timer_: any;
  subscribe_timer_: any;
  timer_time_: number;

  constructor(
    public dialog: MatDialog,
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
    let check_head_fill_water_volume: any;
    let check_head_wash_volume: any;
    let check_head_clamp_check_time: any;
    for (let sct of this.houseService.house.sections) 
    {
      if (is_first) 
	    {        
        
        for (let group of sct.groups) 
        {          
          if (group.type.name == 'clean') 
          {            
            for (let param of group.params) 
            {         
              switch(param.param.name)
              {
                case "check_head_fill_water_volume": check_head_fill_water_volume = param; break;
                case "check_head_wash_volume": check_head_wash_volume = param; break;
                case "check_head_clamp_check_time": check_head_clamp_check_time = param; break
              }
              if (check_head_fill_water_volume !== undefined && check_head_wash_volume !== undefined && check_head_clamp_check_time !== undefined)
              {
                break; 
              }
            }
            break;
          }
        }
        is_first = false;
      }
      else
      {
        let current: any = { sct };
        for (let group of sct.groups) 
        {
          if (group.type.name == 'head') 
          { // api.HeadGroup
            for (let item of group.items) 
            {              	              
              switch(item.type.name) 
              {
                case 'pouring':  current.pouring = item;    break; // api.PouringItem
                case 'volume':  current.cur_volume = item; break; // api.type.item.volume
                case 'pause':  current.pause = item;      break; // api.type.item.pause
                case 'block':  current.block_pouring = item; break;   
                case 'setMode':  current.head_mode = item; break;
                case 'clamp':  current.clamp = item; break;
                case 'release':  current.release = item; break;
              }

              if (current.pouring !== undefined && 
                  current.cur_volume !== undefined && 
                  current.pause !== undefined && 
                  current.block_pouring !== undefined && 
                  current.head_mode !== undefined &&
                  current.clamp !== undefined &&
                  current.release !== undefined)
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
                case 'cleanType': current.step = item;               break; // api.CleanTypeItem
                case 'cleanStep': current.clean_type = item;              break; // api.CleanStepItem
              }

              if (current.step !== undefined && current.clean_type !== undefined)
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
                current.full_volume = item;
              }
            }
            for (let param of group.params)
            {
              if (param.param.name == "volume3")
              {
                current.volume3 = param;
                break;
              }
            }
          }
        }
        if (current.pouring !== undefined && 
            current.step !== undefined && 
            current.cur_volume !== undefined && 
            current.pause !== undefined && 
            current.clean_type !== undefined && 
            current.block_pouring !== undefined &&
            current.head_mode !== undefined &&
            current.full_volume !== undefined &&
            current.clamp !== undefined &&
            current.release !== undefined)
        {
          if (current.pouring.val.display != null && check_head_fill_water_volume !== undefined)
          {
            current.check_head_fill_water_volume = check_head_fill_water_volume;
            current.check_head_wash_volume = check_head_wash_volume;
            current.check_head_clamp_check_time = check_head_clamp_check_time;
            current.value_input = current.clean_type.val.raw == 11 ? current.check_head_fill_water_volume.value : current.clean_type.val.raw == 12 ? 
            current.volume3.value : current.clean_type.val.raw == 13 ? current.check_head_wash_volume.value : current.check_head_clamp_check_time.value;
            items.push(current);            
          }
        }
      }            
    }

    this.items = items;
    this.is_clamp_ = false;
    this.is_releasing_ = false;
    this.is_canceling_ = false;
    this.timer_ = timer(1000, 1000);
  }
	
  click_start_check_button(item: any, type: number): void
  {    
	  this.controlService.writeToDevItem(item.clean_type.id, type);
    switch (type)
    {
      case 11: item.value_input = item.check_head_fill_water_volume.value; break;
      case 12: item.value_input = item.volume3.value; break;
      case 13: item.value_input = item.check_head_wash_volume.value; break;
      case 14: 
        {
          this.is_canceling_ = false;
          item.value_input = item.check_head_clamp_check_time.value;
          this.controlService.writeToDevItem(item.head_mode.id, 1);
          break;
        }
    }
  }
  
  click_change_button(item: any): void
  {    
    this.open_dialog(item);    
  }
  
  write(value: any): void 
  {
    if (value !== undefined && value.value_to_edit >= 0.5)
    {
      value.value_input = value.value_to_edit;
     
      let params: ParamValue[] = [];
      switch(+value.clean_type.val.raw) 
      {
        case 11:
          value.check_head_fill_water_volume.value = value.value_input;
          params.push(value.check_head_fill_water_volume);
          break;
        case 12:
          value.volume3.value = value.value_input;
          params.push(value.volume3);
          break;
        case 13:
          value.check_head_wash_volume.value = value.value_input;
          params.push(value.check_head_wash_volume);
          break;
        case 14:
          value.check_head_clamp_check_time.value = value.value_input;
          params.push(value.check_head_clamp_check_time);
          break;
        default:
          return;
      }    
      this.controlService.changeParamValues(params);
    }            
  }

  open_dialog(item: any): void 
  {
    let dialogRef = this.dialog.open(CheckHeadStandDialogComponent, {
      data: item
    });

    dialogRef.afterClosed().subscribe(result => this.write(result));
  }
  
  click_cancel_check_button(item: any): void
  {    
    if (item.clean_type.val.raw == 14)
    {
      this.click_release_check(item);
    }
    else
    {
      this.controlService.writeToDevItem(item.clean_type.id, 0);    
    }
    this.is_clamp_ = false;
  }
  
  click_stop_check_button(item: any): void
  {
    this.controlService.writeToDevItem(item.block_pouring.id, 1);
  }
  
  get_type_text(item: any): string 
  {
    switch(+item.clean_type.val.raw) 
    {
      case 11: return "Наполнение магистрали водой - налив со второй кеги (вода)";
      case 12: return "Проверка пивом - обычный налив пива с настройкой по умолчанию с первой кеги (пиво)";
      case 13: return "Промывка водой - налив со второй кеги (вода)";
      case 14: return "Проверка поджима"
    }
    return "";
  }   
  
  click_clamp_check(item: any): void
  {     
    // turn on clamp
    // wait 1 seconds
    // turn off clamp    
    // start timer
    this.controlService.writeToDevItem(item.clamp.id, 1);    
    this.is_clamp_ = true;
    this.start_timer(item);
    
    /*const clamp_timer = timer(5000);    
    clamp_timer.subscribe(x => {      
      //this.controlService.writeToDevItem(item.clamp.id, 0);
      //this.is_clamp_ = true;
      //this.start_timer(item);
    });*/
  }
  
  click_release_check(item: any): void
  {
    // turn on clamp
    // wait 1 seconds
    // turn off clamp
    this.controlService.writeToDevItem(item.release.id, 1); 
    const release_timer = timer(6000);    
    release_timer.subscribe(x => {      
      this.stop_timer();
      this.controlService.writeToDevItem(item.release.id, 0);       
      this.controlService.writeToDevItem(item.clean_type.id, 0);
      this.controlService.writeToDevItem(item.head_mode.id, 0);
      this.is_clamp_ = false;    
      this.is_releasing_ = false;      
    });    
    this.is_canceling_ = true;
  }
  
  start_timer(item: any): void
  {
    if (this.subscribe_timer_ == undefined)
    {      
      this.timer_time_ = item.value_input * 60;
      this.subscribe_timer_ = this.timer_.subscribe(val => {
        
        let spend_time = item.value_input * 60 - this.timer_time_;
        if (spend_time >= 6 && spend_time < 7)
        {
          this.controlService.writeToDevItem(item.clamp.id, 0);
        }
        
        this.timer_time_ -= 1;
        if (this.timer_time_ <= 0)
        {
          this.is_releasing_ = true;
          this.stop_timer();
        }
      });
    }
  }
  
  stop_timer(): void
  {
    if (this.subscribe_timer_ != undefined)
    {
      this.subscribe_timer_.unsubscribe();
    }    
    this.subscribe_timer_ = undefined;
  }
}


@Component({
  selector: 'app-check-head-stand-dialog',
  templateUrl: './check-head-stand-dialog.component.html',
  styleUrls: ['../../sections.css', './check-head-stand.component.css']
})
export class CheckHeadStandDialogComponent 
{
  value: any;

  constructor(
    public dialogRef: MatDialogRef<CheckHeadStandDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) 
  {
      this.value = data
      this.value.value_to_edit = this.value.value_input; // some hack
  }

  onNoClick(): void 
  {
    this.dialogRef.close();
  }
}

