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
      for (let group of sct.groups) {
        if (group.type.id == 16) { // api.HeadGroup
          let clean: any = { sct };
          for (let item of group.items) {
            switch(item.type.id) {
              case 62: // api.PouringItem
                clean.pouring = item;
                break;
              case 102: // api.CleanTypeItem
                clean.type = item;
                break;
              case 105: // api.CleanStepItem
                clean.step = item;
                break;
            }
          }
          if (clean.type !== undefined && clean.step !== undefined)
            items.push(clean);
          break;
        }
      }
    }

    this.items = items;
  }

  onChange(clean_type_item: DeviceItem, value: any): void {
    clean_type_item.raw_value = +value;
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
