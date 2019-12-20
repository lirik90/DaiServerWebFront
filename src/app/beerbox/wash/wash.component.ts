import {Component, Inject, Input, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import {Section, DeviceItem, ParamValue, Group} from '../../house/house';
import {HouseService} from '../../house/house.service';
import {ControlService} from '../../house/control.service';
import {TranslateService} from '@ngx-translate/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {AuthenticationService} from '../../authentication.service';
import {ConfirmDialogReplaceKegComponent} from '../replace-keg/replace-keg.component';
import {filter} from 'rxjs/operators';
import {Tap} from '../kegs/kegs.component';
import {Brand, BrandEditDialogComponent, ConfirmEditDialogComponent} from '../brands/brands.component';
import {FormControl, Validators} from '@angular/forms';



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
  disabledWash = false;
  private volumeBeer: ParamValue;

  constructor(
    private houseService: HouseService,
    public dialog: MatDialog,
    private controlService: ControlService,
    private authService: AuthenticationService,
  ) { }

  ngOnInit() {
    this.taps = this.getTaps();

    this.checkParams();
  }

  checkParams(): void {
    const paramGrp = this.houseService.house.sections[0].groups.find(g => g.type.name === 'clean');

    this.volumeBeer = paramGrp.params.find(p => p.param.name === 'volume_beer');
    const volumeBeerValue = parseInt(this.volumeBeer.value, 10);

    if (!volumeBeerValue) {
      this.disabledWash = true;

      const noVolumeBeerDialog = this.dialog.open(ConfirmEditDialogComponent, {
        data: {
          text: 'Для выбора типа промывки необходимо добавить информацию об объеме вытеснения.',
          ybtn: 'Добавить',
          nbtn: 'Отменить'
        },
        disableClose: true
      });
      noVolumeBeerDialog .afterClosed().subscribe(result => {
        if ( result && result.result === 1) {
          this.setWashVol();
        } else {
          this.confirmCancel();
        }
      });
    }
  }

  confirmCancel() {
    const noVolumeBeerDialog = this.dialog.open(ConfirmEditDialogComponent, {
      data: {
        text: 'При отмене добавления вытеснения промывка аппарата не будет осуществлена.',
        ybtn: 'Продолжить',
        nbtn: 'Отменить'
      },
      disableClose: true
    });

    noVolumeBeerDialog.afterClosed().subscribe(r => {
      if (r.result && r.result === 1) {
        this.setWashVol();
      } else {
      }
    });
  }

  setWashVol() {
    const volumeBeerDialog = this.dialog.open(WashVolDialogComponent, {
      data: { },
      disableClose: true
    });
    volumeBeerDialog.afterClosed().subscribe(r => {
      if ( r && r.result) {
        // save
        this.volumeBeer.value = r.result;
        this.controlService.changeParamValues([this.volumeBeer]);
        this.disabledWash = false;
      } else {
        this.confirmCancel();
      }
    });
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

@Component({
  selector: 'app-wash-vol-dialog',
  templateUrl: './wash-vol-dialog.html',
  styleUrls: ['./wash.component.css'],

})
export class WashVolDialogComponent implements OnInit {
  washVol = new FormControl('', [Validators.required]);
  constructor(
    public dialogRef: MatDialogRef<WashVolDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit(): void { }

  close() {
    this.dialogRef.close({result: null});
  }

  save() {
    if (this.washVol.valid) {
      console.log('Value is: `' + this.washVol.value + '\'');
      this.dialogRef.close({result: this.washVol.value});
    }
  }
}
