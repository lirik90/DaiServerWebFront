import { Component, OnInit } from '@angular/core';
import {HouseService} from '../../house/house.service';
import {ControlService} from '../../house/control.service';
import {switchAll} from 'rxjs/operators';
import {ParamValue} from '../../house/house';

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
      this.taps.push({sec: tap, step: 1, intervalId: null});
    });
  }

  nextStep(tap) {
    switch (tap.step) {
      case 1:
        // При запуске калибровки мы записываем 5 в режим работы головы.
        this.controlService.writeToDevItem(
          tap.sec.groups.find(g => g.type.name === 'head')
            .items.find(i => i.type.name === 'setMode').id, 5);

        console.log('waiting to start pouring');
        tap.intervalId = setInterval(() => {
          if (this.isPouring(tap) == true) {
            console.log('start pouring');
            clearInterval(tap.intervalId);
            this.nextStep(tap);
          }
        }, 1000);
        break;

      case 2:
        console.log('waiting to stop pouring');
        tap.intervalId = setInterval(() => {
          if (this.isPouring(tap) == false) {
            console.log('stop pouring');
            clearInterval(tap.intervalId);
            this.nextStep(tap);
          }
        }, 1000);
        break;
    }

    console.log(tap.step);
    tap.step++;
  }

  isPouring(tap: any) {
    const pouring = tap.sec.groups.find(g => g.type.name === 'head')
      .items.find(i => i.type.name === 'pouring');

    return pouring.val.raw == 1;
  }

  getLastPouring(tap: any) {
    const volume = tap.sec.groups.find(g => g.type.name === 'head')
      .items.find(i => i.type.name === 'volume');

    return volume.val.display;
  }

  getMinEmptyVol(tap: any) {
    return Math.round(this.getLastPouring(tap) * 0.95);
  }

  save(tap: any) {
    const val = this.getMinEmptyVol(tap);

    const param = tap.sec.groups.find(g => g.type.name === 'params')
      .params.find(p => p.param.name === 'minEmptyVol');

    param.value = val;

    console.log(param);
    console.log(val);

    const params: ParamValue[] = [];
    params.push(param);
    /*params.push(keg.date_installed);*/
    this.controlService.changeParamValues(params);

    this.controlService.writeToDevItem(
      tap.sec.groups.find(g => g.type.name === 'head')
        .items.find(i => i.type.name === 'setMode').id, 0);

    tap.step = 1;
  }
}
