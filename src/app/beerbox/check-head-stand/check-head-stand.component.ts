import { Component, OnInit } from '@angular/core';
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
  items: any[];

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
      let clean: any = { sct };
      for (let group of sct.groups) 
	    {
        if (group.type.id == 16) 
		    { // api.HeadGroup
          for (let item of group.items) 
		      {
            switch(item.type.id) 
			      {
              case 62:  clean.pouring = item;    break; // api.PouringItem
              case 105: clean.step = item;       break; // api.CleanStepItem
              case 71:  clean.cur_volume = item; break; // api.type.item.volume
              case 99:  clean.pause = item;      break; // api.type.item.pause
			        case 102: clean.clean_type = item; break;
            }

            if (clean.pouring !== undefined && clean.cur_volume !== undefined && clean.pause !== undefined)
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
              clean.full_volume = item;
            }
          }
        }
      }
      if (clean.pouring !== undefined && clean.cur_volume !== undefined && clean.pause !== undefined && clean.full_volume !== undefined)
	    {
        items.push(clean);
	    }
    }

    this.items = items;
  }
	
  click_start_check(index: number, type: number): void
  {    
	  this.controlService.writeToDevItem(this.items[index].clean_type.id, type);
  }
  
  get_type_text(item: any): string 
  {
    switch(item.clean_type.raw_value) 
    {
      case 11: return "Наполнение магистрали водой - налив 100 мл со второй кеги (вода)";
      case 12: return "Проверка - обычный налив пива с настройкой по умолчанию с первой кеги (пиво)";
      case 13: return "Промывка - налив 300 мл воды.";
    }
    return "";
  }
}
