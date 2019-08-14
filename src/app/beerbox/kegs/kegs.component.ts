import {Component, OnInit, Pipe, PipeTransform} from '@angular/core';
import {HouseService} from '../../house/house.service';
import {DeviceItem, Group, ParamValue, Section} from '../../house/house';
import {filter} from 'rxjs/operators';
import {ConfirmDialogReplaceKegComponent} from '../replace-keg/replace-keg.component';
import {MatDialog} from '@angular/material';
import {ControlService} from '../../house/control.service';

interface Head {
  title: string;
  date_installed: ParamValue;
  manufacturer: ParamValue;

  is_not_empty: DeviceItem;
  volume_poured: DeviceItem;
  is_active: DeviceItem;
  bad_clean: DeviceItem;
}

interface Tap {
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

  constructor(
    private houseService: HouseService,
    public dialog: MatDialog,
    private controlService: ControlService
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

      let cleanStep: DeviceItem;

      for (const group of sct.groups) {
        if (group.type.name === 'takeHead') {
          // heads.push(group);
          // TODO: check for undefined
          heads.push({
            title: group.title,
            date_installed: group.params[0].childs.filter((el) => el.param.name === 'date')[0],
            manufacturer: group.params[0].childs.filter((el) => el.param.name === 'name')[0],

            is_not_empty: group.items.filter((el) => el.type.name === 'kegNotEmpty')[0],
            volume_poured: group.items.filter((el) => el.type.name === 'takeHeadCount')[0],
            is_active: group.items.filter((el) => el.type.name === 'takeHead')[0],
            bad_clean: group.items.filter((el) => el.type.name === 'badClean')[0],
          });
        } else if (group.type.name === 'cleanTakehead') {
          for (const item of group.items) {
            switch (item.type.name) {
              case 'cleanStep':
                cleanStep = item;
                break; // api.CleanStepItem
            }

            if (cleanStep !== undefined) {
              break;
            }
          }
        }
      }

      if (heads.length > 0) {
        taps.push({
          name: sct.name,
          sctId: sct.id,
          heads: heads,
          activeTab: cleanStep.val.raw === 0 ? 0 : 1
        });
      }
    }

    return taps;
  }

  getPercentFilled(head: Head): number {
    return (parseFloat(this.kegVolume.value) - parseFloat(head.volume_poured.val.display)) / parseFloat(this.kegVolume.value) * 100;
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

      this.set_manufacture(keg, res.date, res.info);

      // make it not empty
      this.controlService.writeToDevItem(keg.is_not_empty.id, true);
    });
  }

  set_manufacture(keg: Head, date: string, manufacturer_info: string): void
  {
    if (keg.date_installed !== undefined && keg.date_installed != null)
    {
      keg.date_installed.value = date;
    }

    if (keg.manufacturer !== undefined && keg.manufacturer != null)
    {
      keg.manufacturer.value = manufacturer_info;
    }

    const params: ParamValue[] = [];
    params.push(keg.date_installed);
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
}
