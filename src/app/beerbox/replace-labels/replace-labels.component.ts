import {Component, Inject, OnInit} from '@angular/core';
import { ActivatedRoute } from "@angular/router";

import {Section, DeviceItem, ParamValue, Group} from '../../house/house';
import { HouseService } from "../../house/house.service";
import { ControlService } from "../../house/control.service"
import {filter} from 'rxjs/operators';
import {AuthenticationService} from '../../authentication.service';
import {Location} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-replace-labels',
  templateUrl: './replace-labels.component.html',
  styleUrls: ['../../sections.css', './replace-labels.component.css']
})
export class ReplaceLabelsComponent implements OnInit
{

  is_changed_ = true;
  labels_num_full_: any;
  labels_current_num_: any;
  labelsRemain: DeviceItem;

  constructor(
    private route: ActivatedRoute,
    private houseService: HouseService,
    private controlService: ControlService,
    public dialog: MatDialog) { }

  ngOnInit()
  {
    this.get_info();
  }

  get_info(): void
  {
    for (let sct of this.houseService.house.sections)
	  {
      if (sct.id == 1)
      {
        for (let group of sct.groups)
        {
          if (group.type.name == 'printer')
          {
            for (let item of group.items)
            {
              if (item.type.name == 'labels_num')
              {
                this.labelsRemain = item;
              }
            }

            for (let param of group.params)
            {
              if (param.param.name == 'labels_num_full')
              {
                this.labels_num_full_ = param;
                this.labels_num_full_.value = +this.labels_num_full_.value + 10;
              }
            }
          }
        }
      }
    }
  }

  click_apply_button(): void {
    if (this.labels_num_full_.value > 10) {
      let params: ParamValue[] = [];
      this.labels_num_full_.value = +this.labels_num_full_.value - 10;
      params.push(this.labels_num_full_);
      this.controlService.changeParamValues(params);
      this.controlService.writeToDevItem(this.labels_current_num_.id, this.labels_num_full_.value);

      this.labels_num_full_.value = +this.labels_num_full_.value + 10;

      this.openOkDialog();
    }
  }

  openOkDialog() {
    this.dialog.open(OkDialogComponent, {maxWidth: '480px', data: {curNum: this.labels_current_num_, fullNum: this.labels_num_full_} })
      .afterClosed().pipe(
      filter(name => name)
    ).subscribe(res => {
      this.is_changed_ = true;
    });
  }
}


@Component({
  selector: 'app-ok-dialog',
  template: `    <h2 i18n="@@BEERBOX.REPLACE_LABEL.TITLE">Замена ленты</h2>
  <ng-container>
      <h4><p i18n="@@BEERBOX.REPLACE_LABEL.TEXT">Вставте ленту с этикетками в устройство<br><br>Введите количество этикеток, которое указано на ленте</p></h4>
      <mat-form-field>
          <label>
              <input matInput type="number" [(ngModel)]="labels_num_full_.value" i18n-placeholder="@@BEERBOX.REPLACE_LABEL.INPUT" placeholder="Введите количество этикеток"/>
          </label>
      </mat-form-field>
      <div style="text-align: center">
        <button class="button2" mat-stroked-button (click)="click_apply_button()" i18n="@@CONTROL.APPLY">Применить</button>
      </div>
  </ng-container>`,
  styleUrls: ['./replace-labels.component.css'],
})

export class OkDialogComponent implements OnInit {
  labels_current_num_: DeviceItem;
  labels_num_full_: any;

  constructor(
    public dialogRef: MatDialogRef<OkDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private route: ActivatedRoute,
    private houseService: HouseService,
    private controlService: ControlService,
  ) {

  }

  close() {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.get_info();
  }

  get_info(): void
  {
    for (let sct of this.houseService.house.sections)
    {
      if (sct.id == 1)
      {
        for (let group of sct.groups)
        {
          if (group.type.name == 'printer')
          {
            for (let item of group.items)
            {
              if (item.type.name == 'labels_num')
              {
                this.labels_current_num_ = item;
              }
            }

            for (let param of group.params)
            {
              if (param.param.name == 'labels_num_full')
              {
                this.labels_num_full_ = param;
                this.labels_num_full_.value = +this.labels_num_full_.value + 10;
              }
            }
          }
        }
      }
    }
  }

  click_apply_button() {
    if (this.labels_num_full_.value > 10) {
      let params: ParamValue[] = [];
      this.labels_num_full_.value = +this.labels_num_full_.value - 10;
      params.push(this.labels_num_full_);
      this.controlService.changeParamValues(params);
      this.controlService.writeToDevItem(this.labels_current_num_.id, this.labels_num_full_.value);

      this.labels_num_full_.value = +this.labels_num_full_.value + 10;


      this.close();
    }
  }
}
