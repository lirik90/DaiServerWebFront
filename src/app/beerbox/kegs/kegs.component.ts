import { Component, OnInit } from '@angular/core';
import {HouseService} from '../../house/house.service';
import {DeviceItem, Group, ParamValue, Section} from '../../house/house';

interface Head {
  title: string;
  date_installed: ParamValue;

  is_not_empty: DeviceItem;
  volume_poured: DeviceItem;
  is_active: DeviceItem;
}

interface Tap {
  name: string;
  heads: Head[];
}

@Component({
  selector: 'app-kegs',
  templateUrl: './kegs.component.html',
  styleUrls: ['./kegs.component.css']
})
export class KegsComponent implements OnInit {
  taps: Tap[];
  kegVolume: ParamValue;

  constructor(
    private houseService: HouseService
  ) { }

  ngOnInit() {
    this.taps = this.getTaps();

    // TODO: check for undefined
    const deviceSection: Section = this.houseService.house.sections.filter((el) => el.id === 1)[0];
    const procGroup: Group = deviceSection.groups.filter((el) => el.type.name === 'proc')[0];
    this.kegVolume = procGroup.params.filter((el) => el.param.name === 'kegVolume')[0];
  }

  getTaps() {
    const taps = [];

    for (const sct of this.houseService.house.sections) {
      const heads = [];

      for (const group of sct.groups) {
        if (group.type.name === 'takeHead') {
          //heads.push(group);
          // TODO: check for undefined
          heads.push({
            title: group.title,
            date_installed: group.params[0].childs.filter((el) => el.param.name === 'date')[0],
            is_not_empty: group.items.filter((el) => el.type.name === 'kegNotEmpty')[0],
            volume_poured: group.items.filter((el) => el.type.name === 'takeHeadCount')[0],
            is_active: group.items.filter((el) => el.type.name === 'takeHead')[0],
          });
        }
      }

      if (heads.length > 0) {
        taps.push({
          name: sct.name,
          heads: heads
        });
      }
    }

    return taps;
  }
}
