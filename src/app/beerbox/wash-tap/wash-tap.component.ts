import {Component, Inject, Input, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute} from '@angular/router';
import {HouseService} from '../../house/house.service';
import {ControlService} from '../../house/control.service';
import {DeviceItem, Group, ParamItem, ParamValue} from '../../house/house';
import {SafeHtml} from '@angular/platform-browser';
import {BrandEditDialogComponent, ConfirmEditDialogComponent} from '../brands/brands.component';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-wash-tap',
  templateUrl: './wash-tap.component.html',
  styleUrls: ['./wash-tap.component.css']
})
export class WashTapComponent implements OnInit {

  items: any[];

  @Input()
  sctId: number;

  @Input()
  disabledWash: boolean;

  disabledBtn = true;

  constructor(
    public translate: TranslateService,
    private route: ActivatedRoute,
    private houseService: HouseService,
    private controlService: ControlService,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.getSections();
  }

  getSections(): void {
    const items: any[] = [];
    for (const sct of this.houseService.house.sections) {
      if (sct.id !== this.sctId) {
        continue;
      }
      const clean: any = { sct, takehead_count: 0};
      for (const group of sct.groups) {
        if (group.type.name == 'head') {
          for (const item of group.items) {
            switch (item.type.name) {
              case 'pouring':  clean.pouring = item;    break; // api.PouringItem
              case 'volume':  clean.cur_volume = item;  break; // api.type.item.volume
              case 'pause':  clean.pause = item;        break; // api.type.item.pause
              case 'errorCode': clean.error = item;     break;
            }

            if (clean.pouring !== undefined && clean.cur_volume !== undefined && clean.pause !== undefined) {
              break;
            }
          }
        } else if (group.type.name === 'takeHead') {
          ++clean.takehead_count;
        } else if (group.type.name === 'params') { // api.type.group.params
          for (const item of group.items) {
            if (item.type.name === 'setVol3') { // api.type.item.setVol3
              clean.full_volume = item;
              break;
            }
          }
        } else if (group.type.name === 'cleanTakehead') {
          for (let i = 0; i < group.items.length; ++i) {
            const item = group.items[i];
            switch (item.type.name) {
              case 'cleanType': clean.type = item;              break; // api.CleanTypeItem
              case 'cleanStep': clean.step = item;              break; // api.CleanStepItem
              case 'cleanDate':
                clean.date = item;
                break; // api.CleanStepItem
            }
          }
        }
      }
      if (clean.type !== undefined && clean.step !== undefined && clean.pouring !== undefined && clean.cur_volume !== undefined
          && clean.pause !== undefined && clean.full_volume !== undefined) {
        items.push(clean);
      }
      break;
    }

    this.items = items;
  }

  checkParams(paramGrp: Group, type: string): string {
    const params = paramGrp.params.find(p => p.param.name === type);
    let badParam = '';
    for (const prmSubGrp of params.childs) {
      console.log('CHECK: ' + prmSubGrp.param.title);

      for (const prm of prmSubGrp.childs) {
        console.log('CHECK: ' + prm.value);
        const prmVal = prm.value;
        if (!prmVal || prmVal === '0') {
          badParam = prm.param.title;
          break;
        }
      }

      if (badParam) {
        break;
      }
    }

    return badParam;
  }

  onChange(clean_type_item: DeviceItem, value: any): void {
    const val = parseInt(value, 10);
    if (val) {
      // check params
      const paramGrp = this.houseService.house.sections[0].groups.find(g => g.type.name === 'clean');

      let badParam = '';

      switch (val) {
        case 1: // daily
          badParam = this.checkParams(paramGrp, 'daily');
          break;
        case 2:
          badParam = this.checkParams(paramGrp, 'disinfection');
          break;
        case 3:
          badParam = this.checkParams(paramGrp, 'acid');
          break;
      }

      if (!badParam) {
        this.disabledBtn = false;
        clean_type_item.val.raw = val;
      } else {
        this.disabledBtn = true;
        console.log('BAD! ' + badParam);

        const badParamDialog = this.dialog.open(Ok2DialogComponent, {
          data: {
            text1: `Промывка аппарата не может быть запущена так как отсутствует информация по`,
            text2: badParam,
            text3: `Для добавления информации необходимо обратиться в Сервисную службу.`,
            ybtn: 'Ок',
          },
          disableClose: true
        });
      }
    } else {
      this.disabledBtn = true;
      clean_type_item.val.raw = 0;
    }
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
        const tapName = this.getGrp(clean) ? this.getGrp(clean) .title : 'неизвестно';

        return this.translate.instant('BEERBOX.WASH_STEPS.STEP_4');
      }
    }
    return '';
  }

  cleanAgent(clean: any): string {
    const step = clean.step.val.raw;
    if (step === 1 || step === 3) {
      return this.translate.instant('BEERBOX.WASH_AGENTS.AGENT_1');
    } else if (step === 4 || step === 5) {
      return this.translate.instant('BEERBOX.WASH_AGENTS.AGENT_2');
    } else if (step === 2) {
      const type = clean.type.val.raw;
      if (type === 2) {
        return this.translate.instant('BEERBOX.WASH_AGENTS.AGENT_3');
      } else if (type === 3) {
        return this.translate.instant('BEERBOX.WASH_AGENTS.AGENT_4');
      }
    }
    return '';
  }

  getGrp(a) {
    const grp = a.sct.groups.find(g => g.items.find(i => i.type.name === 'takeHead' && i.val.raw == 1) );

    if (grp) {
      return grp.title;
    } else {
      return 0;
    }
  }

  getError(errno: number) {
    let fullError: SafeHtml = '';

    /* TODO: fix the magic constant */
    for (let i = 16384; i > 0; i = i >> 1) {
      // tslint:disable-next-line:no-bitwise
      // console.log(i);
      if (errno & i) {
        fullError += this.translate.instant('FILL_ERRORS.ERROR_' + i) + '<br>';
      }
    }

    return fullError;
  }
}

@Component({
  selector: 'app-ok-dialog',
  templateUrl: './ok-dialog.html',
  styleUrls: ['./wash-tap.component.css'],

})
export class Ok2DialogComponent implements OnInit {
  text1: string;
  text2: string;
  text3: string;
  ybtn: string;

  constructor(
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public translate: TranslateService,
    public dialogRef: MatDialogRef<Ok2DialogComponent>,
  ) {
    this.text1 = data.text1;
    this.text2 = data.text2;
    this.text3 = data.text3;
    this.ybtn = data.ybtn;
  }

  ngOnInit(): void {

  }

  close() {
    this.dialogRef.close({result: null});
  }
}
