import { Component, OnInit } from '@angular/core';
import {HouseService} from '../../house/house.service';
import {ControlService} from '../../house/control.service';
import {switchAll} from 'rxjs/operators';

@Component({
  selector: 'app-cal-vol',
  templateUrl: './cal-vol.component.html',
  styleUrls: ['./cal-vol.component.css']
})
export class CalVolComponent implements OnInit {
  taps = [];

  constructor(
    private houseService: HouseService,
    private controlService: ControlService
  ) { }

  ngOnInit() {
    // fill taps array
    this.houseService.house.sections.filter((sec, index) => index !== 0).map(tap => {
      this.taps.push({sec: tap, step: 1});
    });
  }

  nextStep(tap) {
    switch (tap.step) {
      case 1:
        // При запуске калибровки мы записываем 5 в режим работы головы.
        break;
    }

    tap.step++;
  }
}
