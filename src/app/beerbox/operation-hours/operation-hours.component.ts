import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Section, DeviceItem, ParamValue } from '../../house/house';
import { HouseService } from '../../house/house.service';
import { ControlService } from '../../house/control.service';
import {AuthenticationService} from '../../authentication.service';

@Component({
  selector: 'app-operation-hours',
  templateUrl: './operation-hours.component.html',
  styleUrls: ['../../sections.css', './operation-hours.component.css']
})
export class OperationHoursComponent implements OnInit {
  is_changed_ = false;

  day_start_: ParamValue;
  day_end_: ParamValue;
  time_start_ = '00:00' as string;
  time_stop_ = '00:00' as string;
  is_around_the_clock_ = false;

  can_edit: boolean;

  constructor(
    private route: ActivatedRoute,
    private houseService: HouseService,
    private controlService: ControlService,
    private authService: AuthenticationService) { }

  ngOnInit() {
    this.get_info();
    this.can_edit = this.authService.isKegReplacer();
  }

  get_info(): void {
    for (const sct of this.houseService.house.sections) {
      if (sct.id === 1) {
        for (const group of sct.groups) {
          if (group.type.name === 'proc') {
            for (const parent of group.params) {
              if (parent.param.name === 'day_night') {
                for (const param of parent.childs) {
                  if (param.param.name === 'day_start') {
                    this.day_start_ = param;
                  } else if (param.param.name === 'day_end') {
                    this.day_end_ = param;
                  }
                }
              }
            }
          }
        }
      }
    }

    if (this.day_start_ !== undefined && this.day_end_ !== undefined) {
      this.time_start_ = this.parse_secs_to_hhmm(parseInt(this.day_start_.value, 10));
      this.time_stop_ = this.parse_secs_to_hhmm(parseInt(this.day_end_.value, 10));
    }

    if (this.time_start_ === this.time_stop_) {
      this.is_around_the_clock_ = true;
    }
  }

  parse_secs_to_hhmm(secs: number): string {
    const pad = (val: number) => {
      return ('0' + val.toFixed(0)).slice(-2);
    };

    const hh = pad(Math.floor(secs / 3600));
    const mm = pad(Math.floor(secs % 3600 / 60));

    return `${hh}:${mm}`;
  }

  parse_hhmm_to_secs(hhmm: string): number {
    const arr = hhmm.split(':').reverse();
    let new_value = 0;
    if (arr.length > 1) {
      new_value += parseInt(arr[0], 10) * 60;
      new_value += parseInt(arr[1], 10) * 3600;
    }
    return new_value;
  }

  set_value(e) {
    this.is_around_the_clock_ = e.checked;
  }

  click_apply_button(): void {
    let time_start_sec = this.parse_hhmm_to_secs(this.time_start_);
    let time_stop_sec = this.parse_hhmm_to_secs(this.time_stop_);

    if (this.is_around_the_clock_) {
      time_start_sec = 0;
      time_stop_sec = 0;
    } else if (time_stop_sec === time_start_sec) {
      this.is_around_the_clock_ = true;
    }
    this.day_start_.value = time_start_sec.toString();
    this.day_end_.value = time_stop_sec.toString();

    const params: ParamValue[] = [];
    params.push(this.day_start_);
    params.push(this.day_end_);
    this.controlService.changeParamValues(params);
    this.is_changed_ = true;
  }

  restart(): void {
    if (this.can_edit) {
      this.controlService.restart();
    }
  }

  reloadBtnClick() {
    this.is_changed_ = false;
    this.restart();
  }
}
