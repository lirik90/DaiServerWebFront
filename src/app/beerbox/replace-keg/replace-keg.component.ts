import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';

import { Section, DeviceItem } from "../../house/house";
import { HouseService } from "../../house/house.service";
import { ControlService } from "../../house/control.service";

import {FormControl} from '@angular/forms';
import {MAT_DATE_LOCALE} from '@angular/material/core';

interface Keg {
  parent_id: number;
  item: DeviceItem;
  bad_clean: DeviceItem;
}
interface ReplaceKegSection {
  sct: Section;
  kegs: Keg[];
  have_empty: boolean;
}

@Component({
  selector: 'app-replace-keg',
  templateUrl: './replace-keg.component.html',
  styleUrls: ['../../sections.css', './replace-keg.component.css'],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'en-AU'},
  ],
})
export class ReplaceKegComponent implements OnInit 
{  
  items: ReplaceKegSection[];

  have_empty: boolean = false;

  constructor(
    public dialog: MatDialog,
    private houseService: HouseService,
    private controlService: ControlService
  ) { }

  ngOnInit() {
    this.getSections();    
  }

  checkEmpty(): void {
    let empty: boolean = false;
    for (let item of this.items) {
      let have_empty: boolean = false;
      for (let keg of item.kegs) {
        if (keg.item.raw_value == 0) {
          have_empty = true;
          if (!empty)
            empty = true;
          break;
        }
      }
      item.have_empty = have_empty;
    }
    this.have_empty = empty;
  }

  addKeg(sct: Section, dev_item: DeviceItem, is_empty_check: boolean): void {
    let sct_item: ReplaceKegSection;
    for (let item of this.items) {
      if (item.sct.id == sct.id) {
        sct_item = item;
        break;
      }
    }

    let add_sct: boolean = false;
    if (!sct_item) {
      sct_item = { sct, kegs: [], have_empty: false} as ReplaceKegSection;
      add_sct = true;
    }

    let keg_item: Keg;
    for (let keg of sct_item.kegs) {
      if (keg.parent_id == dev_item.parent_id) {
        keg_item = keg;
        break;
      }
    }

    let add_keg: boolean = false;
    if (!keg_item) {
      keg_item = { parent_id: dev_item.parent_id, item: undefined, bad_clean: undefined } as Keg;
      add_keg = true;
    }

    if (is_empty_check)
      keg_item.item = dev_item;
    else
      keg_item.bad_clean = dev_item;

    if (add_keg)
      sct_item.kegs.push(keg_item);
    if (add_sct)
      this.items.push(sct_item);
  }

  getSections(): void {
    this.items = [];
    let is_first: boolean = true;
    for (let sct of this.houseService.house.sections) {
      if (is_first) {
        is_first = false;
        continue;
      }
      for (let group of sct.groups) {
        if (group.type.id == 19) { // api.TakeHeadGroup
          for (let item of group.items) {
            if (item.type.id == 100) // api.KegNotEmptyItem
              this.addKeg(sct, item, true);
            if (item.type.id == 103) // api.badClean
              this.addKeg(sct, item, false);
          }
          break;
        }
      }
    }

    this.checkEmpty();
  }

  toggle(keg: DeviceItem): void {
    this.controlService.writeToDevItem(keg.id, true);
  }

  openDialog(keg: DeviceItem): void {
    this.dialog.open(ConfirmDialogReplaceKegComponent, {width: '80%'})
    .afterClosed().subscribe(res => {
      if (res) 
        this.toggle(keg);
    });
  }
  
  openDialog2(): void {
    this.dialog.open(ConfirmDialogReplaceKegComponent, {width: '80%'})
    .afterClosed();
  }
}

@Component({
  selector: 'app-confirm-dialog-replace-keg',
  templateUrl: './confirm-dialog-replace-keg.component.html',
  styleUrls: ['./replace-keg.component.css']
})
export class ConfirmDialogReplaceKegComponent 
{
  date = new FormControl(new Date());
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogReplaceKegComponent>,
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
