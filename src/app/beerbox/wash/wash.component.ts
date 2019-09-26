import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import {Section, DeviceItem, ParamValue, Group} from '../../house/house';
import {HouseService} from '../../house/house.service';
import {ControlService} from '../../house/control.service';
import {TranslateService} from '@ngx-translate/core';
import {MatDialog} from '@angular/material';
import {AuthenticationService} from '../../authentication.service';
import {ConfirmDialogReplaceKegComponent} from '../replace-keg/replace-keg.component';
import {filter} from 'rxjs/operators';
import {Tap} from '../kegs/kegs.component';



@Component({
  selector: 'app-wash',
  templateUrl: './wash.component.html',
  styleUrls: ['../../sections.css', './wash.component.css']
})
export class WashComponent implements OnInit {
  taps: Tap[];
  kegVolume: ParamValue;

  manufacturers_: string[];
  is_printer_auto_: boolean;

  temperature: DeviceItem;
  cooler: Group;
  gas: Group;
  pressure: DeviceItem;

  canSeeWash = this.authService.isSupervisor() || this.authService.isCleaner();

  constructor(
    private houseService: HouseService,
    public dialog: MatDialog,
    private controlService: ControlService,
    private authService: AuthenticationService,
  ) { }

  ngOnInit() {
    this.taps = this.getTaps();
  }

  getTaps() {
    const taps = [];

    for (const sct of this.houseService.house.sections) {
      const heads = [];

      let cleanStep: DeviceItem;
      let isBlocked: DeviceItem;
      let mode: DeviceItem;

      for (const group of sct.groups) {
        if (group.type.name === 'takeHead') {
          // heads.push(group);
          // TODO: check for undefined
          console.log(group);
          heads.push({
            title: group.title,
          });
        } else if (group.type.name === 'cleanTakehead') {
          for (const item of group.items) {
            if (item.type.name === 'cleanStep') {
              cleanStep = item;
            }

            if (cleanStep !== undefined) {
              break;
            }
          }
        } else if (group.type.name === 'head') {
          for (const item of group.items) {
            if (item.type.name === 'block') {
              isBlocked = item;
            }

            if (isBlocked !== undefined) {
              break;
            }

            mode = group.items.find((el) => el.type.name === 'setMode');
          }
        }
      }

      if (heads.length > 0) {
        taps.push({
          name: sct.name,
          sctId: sct.id,
          heads: heads,
          isBlocked: isBlocked,
          mode: mode
        });
      }
    }

    return taps;
  }
}
