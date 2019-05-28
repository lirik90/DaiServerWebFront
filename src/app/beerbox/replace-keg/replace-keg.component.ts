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

interface Keg 
{
  item: DeviceItem;
  bad_clean: DeviceItem;
  manufacture_date_: ParamValue;
  manufacturer_name_: ParamValue;
}

interface ReplaceKegSection 
{
  sct: Section;
  kegs: Keg[];
  has_empty: boolean;
}

@Component({
  selector: 'app-replace-keg',
  templateUrl: './replace-keg.component.html',
  styleUrls: ['../../sections.css', './replace-keg.component.css'],
})

export class ReplaceKegComponent implements OnInit 
{  
  items: ReplaceKegSection[];

  constructor(
    public dialog: MatDialog,
    private houseService: HouseService,
    private controlService: ControlService
  ) { }

  ngOnInit() 
  {
    this.get_data();    
  }

  has_empty_keg(item: ReplaceKegSection): boolean
  {
    for (let keg of item.kegs) 
      if (keg.item.val.raw == 0) 
        return item.has_empty = true;
    return item.has_empty = false;
  }
 
  get has_empty(): boolean
  {
    let empty = false;
    for (let item of this.items) 
      if (this.has_empty_keg(item) && !empty)
        empty = true;
    return empty;
  }

  get_data(): void
  {
    this.items = [];
    let is_first: boolean = true;    
    for (let sct of this.houseService.house.sections) 
    {
      if (is_first) 
      {
        is_first = false;
        continue;
      }
            
      let sct_item: ReplaceKegSection = {sct, kegs: [], has_empty: false};
      
      for (let group of sct.groups) 
      {                
        if (group.type.name == 'takeHead') 
        { 
          let kegNotEmpty: DeviceItem;
          let badClean: DeviceItem;
          let name: ParamValue;
          let date: ParamValue;
          for (let item of group.items) 
          {
            if (item.type.name == 'kegNotEmpty')
            {
              kegNotEmpty = item;
            }
            if (item.type.name == 'badClean')
            {
              badClean = item;
            }            
          }
          
          for (let param of group.params) 
          {
            if (param.param.name == 'name')
            {
              name = param;
            }
            if (param.param.name == 'date')
            {
              date = param;
            }
          }
          
          if (kegNotEmpty !== undefined && kegNotEmpty != null)
          {
            let keg_item: Keg = {item: kegNotEmpty, bad_clean: badClean, manufacture_date_: date, manufacturer_name_: name};
            sct_item.kegs.push(keg_item);
          }          
        }
      }
      
      if (sct_item.kegs.length > 0)
      {
        this.items.push(sct_item);
      }      
    }
  }

  toggle(keg: DeviceItem): void 
  {
    this.controlService.writeToDevItem(keg.id, true);
  }
  
  set_manufacture(keg: Keg, date: string, manufacturer_info: string): void
  {
    if (date == undefined || date.length == 0)
    {
      return;
    }

    if (keg.manufacture_date_ !== undefined && keg.manufacture_date_ != null)
    {
      keg.manufacture_date_.value = date;
    }
    
    if (keg.manufacturer_name_ !== undefined && keg.manufacturer_name_ != null)
    {
      keg.manufacturer_name_.value = manufacturer_info;
    }
    
    let params: ParamValue[] = [];
    params.push(keg.manufacture_date_)
    params.push(keg.manufacturer_name_)
    this.controlService.changeParamValues(params);
  }

  openDialog(keg: Keg): void 
  {    
    let manufacturer_info_item: string;
    if (keg.manufacturer_name_ !== undefined && keg.manufacturer_name_ != null)
    {
      manufacturer_info_item = keg.manufacturer_name_.value;    
    }
    
    this.dialog.open(ConfirmDialogReplaceKegComponent, {width: '80%', data: {info: manufacturer_info_item}})
    .afterClosed().pipe(
      filter(name => name)
    ).subscribe(res => { 
      this.toggle(keg.item);
      this.set_manufacture(keg, res.date, res.info);
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
  
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogReplaceKegComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) 
  {
    this.input_date_ = this.date.value.format('DD.MM.YYYY');
    this.manufacturer_info_ = data.info;
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
