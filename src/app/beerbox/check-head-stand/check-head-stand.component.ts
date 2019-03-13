import { Component, OnInit, Input, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ActivatedRoute } from "@angular/router";

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
  items: any[];

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
    for (let sct of this.houseService.house.sections) 
    {
      if (is_first) 
	    {        
        
        for (let group of sct.groups) 
        {          
          if (group.type.id == 20) 
          {            
            for (let param of group.params) 
            {         
              switch(param.param.name)
              {
                case "check_head_fill_water_volume": check_head_fill_water_volume = param; break;
                case "check_head_wash_volume": check_head_wash_volume = param; break;
              }
              if (check_head_fill_water_volume !== undefined && check_head_wash_volume !== undefined)
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
        if (current.pouring !== undefined && current.step !== undefined && current.cur_volume !== undefined && current.pause !== undefined && current.clean_type !== undefined && current.block_pouring !== undefined && current.full_volume !== undefined)
        {
          if (current.pouring.value != null && check_head_fill_water_volume !== undefined)
          {
            current.check_head_fill_water_volume = check_head_fill_water_volume;
            current.check_head_wash_volume = check_head_wash_volume;
            current.volume_input = current.clean_type.raw_value == 11 ? current.check_head_fill_water_volume.value : current.clean_type.raw_value == 12 ? current.volume3.value : current.check_head_wash_volume.value;            
            items.push(current);            
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
      case 11: item.volume_input = item.check_head_fill_water_volume.value; break;
      case 12: item.volume_input = item.volume3.value; break;
      case 13: item.volume_input = item.check_head_wash_volume.value; break;
    }
  }
  
  click_change_button(item: any): void
  {    
    this.open_dialog(item);    
  }
  
  write(value: any): void 
  {
    if (value !== undefined)
    {
      value.volume_input = value.volume_to_edit;
     
      let params: ParamValue[] = [];
      switch(+value.clean_type.raw_value) 
      {
        case 11:
          value.check_head_fill_water_volume.value = value.volume_input;
          params.push(value.check_head_fill_water_volume);
          break;
        case 12:
          value.volume3.value = value.volume_input;
          params.push(value.volume3);
          break;
        case 13:
          value.check_head_wash_volume.value = value.volume_input;
          params.push(value.check_head_wash_volume);
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
    this.controlService.writeToDevItem(item.clean_type.id, 0);
  }
  
  click_stop_check_button(item: any): void
  {
    this.controlService.writeToDevItem(item.block_pouring.id, 1);
  }
  
  get_type_text(item: any): string 
  {
    switch(+item.clean_type.raw_value) 
    {
      case 11: return "Наполнение магистрали водой - налив со второй кеги (вода)";
      case 12: return "Проверка пивом - обычный налив пива с настройкой по умолчанию с первой кеги (пиво)";
      case 13: return "Промывка водой - налив со второй кеги (вода)";
    }
    return "";
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
      this.value.volume_to_edit = this.value.volume_input; // some hack
  }

  onNoClick(): void 
  {
    this.dialogRef.close();
  }
}

