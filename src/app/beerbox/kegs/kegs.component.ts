import {Component, OnInit} from '@angular/core';
import {HouseService} from '../../house/house.service';
import {DeviceItem, Group, ParamValue, Section} from '../../house/house';
import {filter} from 'rxjs/operators';
import {ConfirmDialogReplaceKegComponent} from '../replace-keg/replace-keg.component';
import {MatDialog} from '@angular/material';
import {ControlService} from '../../house/control.service';
import {AuthenticationService} from '../../authentication.service';

export interface Head {
  date_made: ParamValue;
  title: string;
  date_installed: DeviceItem;
  manufacturer: ParamValue;

  is_not_empty: DeviceItem;
  volume_poured: DeviceItem;
  is_active: DeviceItem;
  bad_clean: DeviceItem;
}

export interface Tap {
  mode: DeviceItem;
  isBlocked: DeviceItem;
  sctId: number;
  name: string;
  heads: Head[];
  activeTab: number;
}

@Component({
  selector: 'app-kegs',
  templateUrl: './kegs.component.html',
  styleUrls: ['./kegs.component.css']
})
export class KegsComponent implements OnInit {
  taps: Tap[];
  kegVolume: ParamValue;

  manufacturers_: string[];
  is_printer_auto_: boolean;

  temperature: DeviceItem;
  cooler: Group;
  gas: Group;
  pressure: DeviceItem;

  canSeeWash = this.authService.canChangeHouse() || this.authService.canAddDeviceItem();

  constructor(
    private houseService: HouseService,
    public dialog: MatDialog,
    private controlService: ControlService,
    private authService: AuthenticationService,
  ) { }

  ngOnInit() {
    this.get_data();
    this.taps = this.getTaps();

    // TODO: check for undefined
    const deviceSection: Section = this.houseService.house.sections.filter((el) => el.id === 1)[0];
    const procGroup: Group = deviceSection.groups.filter((el) => el.type.name === 'proc')[0];
    this.kegVolume = procGroup.params.filter((el) => el.param.name === 'kegVolume')[0];

    this.getCooler();
    this.getGas();
  }

  getTaps() {
    const taps = [];

    for (const sct of this.houseService.house.sections) {
      const heads = [];

      let isBlocked: DeviceItem;
      let mode: DeviceItem;

      for (const group of sct.groups) {
        if (group.type.name === 'takeHead') {
          // heads.push(group);
          // TODO: check for undefined
          console.log(group);
          heads.push({
            title: group.title,
            date_made: group.params[0].childs.filter((el) => el.param.name === 'date')[0],
            manufacturer: group.params[0].childs.filter((el) => el.param.name === 'name')[0],

            is_not_empty: group.items.filter((el) => el.type.name === 'kegNotEmpty')[0],
            volume_poured: group.items.filter((el) => el.type.name === 'takeHeadCount')[0],
            is_active: group.items.filter((el) => el.type.name === 'takeHead')[0],
            bad_clean: group.items.filter((el) => el.type.name === 'badClean')[0],
            date_installed: group.items.filter((el) => el.type.name === 'keg_replacement_date')[0],
            bottle_counter: group.items.find((el) => el.type.name === 'bottle_counter'),
            extrude_counter: group.items.find((el) => el.type.name === 'extrude_counter'),
            pouring_error_counter: group.items.find((el) => el.type.name === 'pouring_error_counter'),
            extrude_error_counter: group.items.find((el) => el.type.name === 'extrude_error_counter'),
          });
        } else if (group.type.name === 'head') {
          for (const item of group.items) {
            if (item.type.name === 'block') {
              isBlocked = item;
            }

            if (isBlocked !== undefined) {
              break;
            }

            mode =  group.items.find((el) => el.type.name === 'setMode');
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

  getPercentFilled(head: Head): number {
    if (head.is_not_empty.val.display) {
      return (parseFloat(this.kegVolume.value) - parseFloat(head.volume_poured.val.display)) / parseFloat(this.kegVolume.value) * 100;
    } else {
      return 0;
    }
  }

  round(val: number) {
    return Math.round(val);
  }

  openDialog(keg: Head) {
    this.dialog.open(ConfirmDialogReplaceKegComponent,
      {
        width: '80%',
        data: {manufacturers: this.manufacturers_, is_printer_auto: this.is_printer_auto_}
      })
      .afterClosed().pipe(
      filter(name => name)
    ).subscribe(res => {
      /*
      this.toggle(keg.item);
      this.set_manufacture(keg, res.date, res.info);
       *//*
      console.log(keg);
      console.log(res);*/

      // make it not empty
      this.controlService.writeToDevItem(keg.volume_poured.id, 0);
      this.controlService.writeToDevItem(keg.is_not_empty.id, true);

      this.set_manufacture(keg, res.date, res.info);
    });
  }

  set_manufacture(keg: Head, date: string, manufacturer_info: string): void {
    if (keg.date_made !== undefined && keg.date_made != null) {
      keg.date_made.value = date;
    }
/*
    if (keg.date_installed !== undefined && keg.date_installed != null) {
      keg.date_installed.value = (new Date()).toLocaleDateString('ru');
    }
*/
    if (keg.manufacturer !== undefined && keg.manufacturer != null) {
      keg.manufacturer.value = manufacturer_info;
    }

    const params: ParamValue[] = [];
    params.push(keg.date_made);
    /*params.push(keg.date_installed);*/
    params.push(keg.manufacturer);
    this.controlService.changeParamValues(params);
  }

  get_data(): void {
    const sct = this.houseService.house.sections[0];

    for (const group of sct.groups) {
      if (group.type.name === 'label_general') {
        for (const param of group.params) {
          if (param.param.name === 'manufacturers') {
            if (param.value !== undefined && param.value !== null && param.value.length) {
              this.manufacturers_ = param.value.split('|');
            }
          }
        }
      } else if (group.type.name === 'printer') {
        this.is_printer_auto_ = group.mode === 2;
      }
    }
  }

  getCooler() {
    const sct = this.houseService.house.sections[0];

    for (const group of sct.groups) {
      if (group.type.name === 'cooler') {

        this.cooler = group;

        for (const item of group.items) {
          if (item.type.name === 'termoCool') {
            this.temperature = item;
            break;
          }
        }

        break;
      }
    }
  }

  private getGas() {
    const sct = this.houseService.house.sections[0];

    for (const group of sct.groups) {
      if (group.type.name === 'pressure') {

        this.gas = group;

        for (const item of group.items) {
          if (item.type.name === 'pressurePipe') {
            this.pressure = item;
            break;
          }
        }

        break;
      }
    }
  }

  changeActiveTab(tap: Tap, number: number) {
    tap.activeTab = number;
  }

  getRemainBeer(head: Head) {
    if (head.is_not_empty.val.display) {
      if (head.volume_poured.val.display === null) {
        return 'Не подключено';
      }

      return parseFloat(this.kegVolume.value) - parseFloat(head.volume_poured.val.display) + ' мл.';
    } else {
      return 0;
    }
  }

  getPoured(head) {
    if (head.volume_poured.val.display === null) {
      return 'Не подключено';
    }

    return head.volume_poured.val.display + ' мл.';
  }
}
