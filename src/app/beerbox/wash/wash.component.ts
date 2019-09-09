import {Component, Input, OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import { Section, DeviceItem } from '../../house/house';
import { HouseService } from '../../house/house.service';
import { ControlService } from '../../house/control.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-wash',
  templateUrl: './wash.component.html',
  styleUrls: ['../../sections.css', './wash.component.css']
})
export class WashComponent implements OnInit {
  items: any[];

  constructor(
    public translate: TranslateService,
    private route: ActivatedRoute,
    private houseService: HouseService,
    private controlService: ControlService
  ) { }

  ngOnInit() {
    this.getSections();
  }

  getSections(): void {
    const items: any[] = [];
    let is_first = true;
    for (const sct of this.houseService.house.sections) {
      if (is_first) {
        is_first = false;
        continue;
      }
      const clean: any = { sct, takehead_count: 0 };
      for (const group of sct.groups) {
        if (group.type.name == 'head') {
          for (const item of group.items) {
            switch (item.type.name) {
              case 'pouring':  clean.pouring = item;    break; // api.PouringItem
              case 'volume':  clean.cur_volume = item;  break; // api.type.item.volume
              case 'pause':  clean.pause = item;        break; // api.type.item.pause
            }

            if (clean.pouring !== undefined && clean.cur_volume !== undefined && clean.pause !== undefined) {
              break;
            }
          }
        } else if (group.type.name == 'takeHead') {
			    ++clean.takehead_count;
		    } else if (group.type.name == 'params') { // api.type.group.params
          for (const item of group.items) {
            if (item.type.name == 'setVol3') { // api.type.item.setVol3
              clean.full_volume = item;
              break;
            }
          }
        } else if (group.type.name == 'cleanTakehead') {
          for (const item of group.items) {
            switch (item.type.name) {
              case 'cleanType': clean.type = item;              break; // api.CleanTypeItem
              case 'cleanStep': clean.step = item;              break; // api.CleanStepItem
            }

            if (clean.type !== undefined && clean.step !== undefined) {
              break;
            }
          }
        }
      }
      if (clean.type !== undefined && clean.step !== undefined && clean.pouring !== undefined && clean.cur_volume !== undefined && clean.pause !== undefined && clean.full_volume !== undefined) {
        items.push(clean);
      }
    }

    this.items = items;
  }

  onChange(clean_type_item: DeviceItem, value: any): void {
    clean_type_item.val.raw = +value;
  }

  start(clean: any): void {
    this.controlService.writeToDevItem(clean.type.id, clean.type.val.raw);
  }

  stepText(clean: any): string {

    switch (clean.step.val.raw) {
      case 1: return this.translate.instant('BEERBOX.WASH_STEPS.STEP_1');
      case 2: return this.translate.instant('BEERBOX.WASH_STEPS.STEP_2');
      case 3: return this.translate.instant('BEERBOX.WASH_STEPS.STEP_3');
      case 4: case 5: case 6: {
        /*
          let sct_i = 0;
          if (clean.takehead_count > 1) {
            sct_i = ((clean === this.items[0] ? 0 : 1) * 2 ) + 1;
            sct_i += (clean.step.val.raw == 6 ? 1 : 0);
          } else {
            sct_i = this.items.indexOf(clean) + 1;
          }

         */
        const tapName = this.getGrp(clean) ? this.getGrp(clean) .title : 'неизвестно';

          return this.translate.instant('BEERBOX.WASH_STEPS.STEP_4') + tapName;
        }
    }
    return '';
  }

  cleanAgent(clean: any): string {
    const step = clean.step.val.raw;
    if (step == 1 || step == 3) {
      return this.translate.instant('BEERBOX.WASH_AGENTS.AGENT_1');
    } else if (step == 4 || step == 5) {
      return this.translate.instant('BEERBOX.WASH_AGENTS.AGENT_2');
    } else if (step == 2) {
      const type = clean.type.val.raw;
      if (type == 2) {
        return this.translate.instant('BEERBOX.WASH_AGENTS.AGENT_3');
      } else if (type == 3) {
        return this.translate.instant('BEERBOX.WASH_AGENTS.AGENT_4');
      }
    }
    return '';
  }

  getGrp(a) {
    return a.sct.groups.find(g => g.items.find(i => i.type.name === 'takeHead' && i.val.raw === 1) );
  }
}
