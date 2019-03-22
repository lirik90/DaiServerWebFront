import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { Section, DeviceItem, ParamValue } from "../../house/house";
import { HouseService } from "../../house/house.service";
import { ControlService } from "../../house/control.service";

import {FormControl} from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import { filter } from 'rxjs/operators';
import * as _moment from 'moment';
//import { default as _rollupMoment } from 'moment';

interface Keg {
  parent_id: number;
  item: DeviceItem;
  bad_clean: DeviceItem;
  manufacture_date: DeviceItem;
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
})
export class ReplaceKegComponent implements OnInit 
{  
  items: ReplaceKegSection[];
  manufacture_date_list_: DeviceItem[] = [];
  manufacturers_list_: DeviceItem[] = [];

  have_empty: boolean = false;
  is_printer_set: boolean = false;

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

  addKeg(sct: Section, dev_item: DeviceItem, is_empty_check: boolean): void 
  {
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
      keg_item = { parent_id: dev_item.parent_id, item: undefined, bad_clean: undefined, manufacture_date: undefined } as Keg;
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
            
      for (let group of sct.groups) 
      {
        if (group.type.id == 19) 
        { // api.TakeHeadGroup
          for (let item of group.items) 
          {
            if (item.type.id == 100) // api.KegNotEmptyItem
              this.addKeg(sct, item, true);
            if (item.type.id == 103) // api.badClean
              this.addKeg(sct, item, false);
            if (item.type.name == 'manufacture_date')
            {
              this.manufacture_date_list_.push(item);
            }
            if (item.type.name == 'manufacturer_info')
            {
              this.manufacturers_list_.push(item);
            }
          }
        }        
      }
    }
    
    if (this.manufacture_date_list_.length > 0 && this.manufacturers_list_.length > 0)
    {
      this.is_printer_set = true;
    }
    
    this.checkEmpty();
  }

  toggle(keg: DeviceItem): void 
  {
    this.controlService.writeToDevItem(keg.id, true);
  }
  
  set_manufacture_date(keg: DeviceItem, date: string): void
  {
    if (date == undefined || date.length == 0)
    {
      return;
    }
    
    for (let item of this.manufacture_date_list_)
    {
      if (item.parent_id == keg.parent_id)
      {
        this.controlService.writeToDevItem(item.id, date);
        break;
      }
    }
  }
  
  set_manufacturer_info(keg: DeviceItem, manufacturer_info: string): void
  {
    if (manufacturer_info == undefined || manufacturer_info.length == 0)
    {
      return;
    }
    
    for (let item of this.manufacturers_list_)
    {
      if (item.parent_id == keg.parent_id)
      {
        this.controlService.writeToDevItem(item.id, manufacturer_info);
        break;
      }
    }
  }

  openDialog(keg: DeviceItem,): void 
  {    
    let manufacturer_info_item: string;
    for (let item of this.manufacturers_list_)
    {
      if (item.parent_id == keg.parent_id)
      {
        manufacturer_info_item = item.value;
        break;
      }
    }    
    
    this.dialog.open(ConfirmDialogReplaceKegComponent, {width: '80%', data: {info: manufacturer_info_item, is_printer: this.is_printer_set}})
    .afterClosed().pipe(
      filter(name => name)
    ).subscribe(res => { 
      this.toggle(keg);
      this.set_manufacture_date(keg, res.date);
      this.set_manufacturer_info(keg, res.info);
    });
  }
}

const moment = _moment;// _rollupMoment || _moment;
export const CUSTOM_FORMATS = {
  parse: {
    dateInput: 'DD.MM.YYYY',
  },
  display: {
    dateInput: 'DD.MM.YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-confirm-dialog-replace-keg',
  templateUrl: './confirm-dialog-replace-keg.component.html',
  styleUrls: ['./replace-keg.component.css'],
  providers: [

    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },

    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_FORMATS },
  ],
})

export class ConfirmDialogReplaceKegComponent 
{
  date = new FormControl(moment());
  input_date_: string;
  manufacturer_info_: string;
  is_printer_set: boolean;
  
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogReplaceKegComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) 
  {
    this.input_date_ = this.date.value.format('DD.MM.YYYY');
    this.manufacturer_info_ = data.info;
    this.is_printer_set = data.is_printer;
  }
  
  confirm(): void
  {
    this.dialogRef.close({date: this.input_date_, info: this.manufacturer_info_});
  }

  change(dateEvent) 
  {
    this.input_date_ = dateEvent.value.format('DD.MM.YYYY');
  }
}
