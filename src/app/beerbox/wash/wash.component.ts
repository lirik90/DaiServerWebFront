import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

import { Section, DeviceItem } from "../../house/house";
import { HouseService } from "../../house/house.service";
import { ControlService } from "../../house/control.service";

@Component({
  selector: 'app-wash',
  templateUrl: './wash.component.html',
  styleUrls: ['../../sections.css', './wash.component.css']
})
export class WashComponent implements OnInit {
  items: any[];

  constructor(
    private route: ActivatedRoute,
    private houseService: HouseService,
    private controlService: ControlService
  ) { }

  ngOnInit() {
    this.getSections();
  }

  getSections(): void {
    let items: any[] = [];
    let is_first: boolean = true;
    for (let sct of this.houseService.house.sections) {
      if (is_first) {
        is_first = false;
        continue;
      }
      let clean: any = { sct };
      for (let group of sct.groups) {
        if (group.type.id == 16) { // api.HeadGroup
          for (let item of group.items) {
            switch(item.type.id) {
              case 62:  clean.pouring = item;    break; // api.PouringItem
              case 102: clean.type = item;       break; // api.CleanTypeItem
              case 105: clean.step = item;       break; // api.CleanStepItem
              case 71:  clean.cur_volume = item; break; // api.type.item.volume
              case 99:  clean.pause = item;      break; // api.type.item.pause
            }

            if (clean.type !== undefined && clean.step !== undefined && clean.pouring !== undefined && clean.cur_volume !== undefined && clean.pause !== undefined)
              break;
          }
        } else if (group.type.id == 17) { // api.type.group.params
          for (let item of group.items) {
            if (item.type.id == 96) { // api.type.item.setVol3
              clean.full_volume = item;
            }
          }
        }
      }
      if (clean.type !== undefined && clean.step !== undefined && clean.pouring !== undefined && clean.cur_volume !== undefined && clean.pause !== undefined && clean.full_volume !== undefined)
        items.push(clean);
    }

    this.items = items;
  }

  onChange(clean_type_item: DeviceItem, value: any): void {
    clean_type_item.val.raw = +value;
  }

  start(clean: any): void {
    this.controlService.writeToDevItem(clean.type.id, clean.type.raw_value);
  }

  stepText(clean: any): string {
    switch(clean.step.raw_value) {
      case 1: return "Промывка водой";
      case 2: return "Моющий агент";
      case 3: return "Ополаскивание водой";
      case 4: case 5: case 6:
        let sct_i = ((clean === this.items[0] ? 0 : 1) * 2 ) + 1;
        return "Вытеснение воды пивом. Заборная головка №" + (sct_i + (clean.step.raw_value == 6 ? 1 : 0));
    }
    return "";
  }

  cleanAgent(clean: any): string {
    const step = clean.step.raw_value;
    if (step == 1 || step == 3)
      return "Вода питьевого качества";
    else if (step == 4 || step == 5)
      return "Пиво";
    else if (step == 2) {
      const type = clean.type.raw_value;
      if (type == 2)
        return "Раствор на основе моюще-дезинфецирующего средства FT-89 CIP или аналога";
      else if (type == 3)
        return "Раствор на основе кислотного моющего средства FINK Acid kombi или аналога";
    }
    return "";
  } 
}
