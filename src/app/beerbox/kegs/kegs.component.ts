import { Component, OnInit } from '@angular/core';
import {HouseService} from '../../house/house.service';

interface Head {
  name: string;
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

  constructor(
    private houseService: HouseService
  ) { }

  ngOnInit() {
    this.taps = this.getTaps();
  }

  getTaps() {
    const taps = [];

    for (const sct of this.houseService.house.sections) {
      const heads = [];

      for (const group of sct.groups) {
        if (group.type.name === 'takeHead') {
          heads.push(group);
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
