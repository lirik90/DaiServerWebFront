import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, NativeDateAdapter} from '@angular/material/core';

import { ItemType, GroupType, Section, DeviceItem, LogData } from '../../house';
import { HouseService, ExportConfig, ExportItem } from '../../house.service';
import { HousesService } from '../../../houses/houses.service';
import { House } from '../../../user';
import {ActivatedRoute} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';

import moment from 'moment-timezone';
import { Moment } from 'moment';
import {UIService} from '../../../ui.service';

export enum ExportType {
  IDLE,
  POURING
}

export class RussianDateAdapter extends NativeDateAdapter {
  parse(value: any): Date | null {
    if ((typeof value === 'string') && (value.indexOf('/') > -1)) {
      const str = value.split('.');
      if (str.length < 2 || isNaN(+str[0]) || isNaN(+str[1]) || isNaN(+str[2])) {
        return null;
      }
      return new Date(Number(str[2]), Number(str[1]) - 1, Number(str[0]), 12);
    }
    const timestamp = typeof value === 'number' ? value : Date.parse(value);
    return isNaN(timestamp) ? null : new Date(timestamp);
  }
}

interface TimeZone {
  title: string;
  offset: string;
  value: string;
}

@Component({
  selector: 'app-export',
  templateUrl: './export2.component.html',
  styleUrls: ['./export2.component.css'],
/*  providers: [
    // The locale would typically be provided on the root module of your application. We do it at
    // the component level here, due to limitations of our example generation script.
    {provide: MAT_DATE_LOCALE, useValue: 'ru-RU'},

    // `MomentDateAdapter` and `MAT_MOMENT_DATE_FORMATS` can be automatically provided by importing
    // `MatMomentDateModule` in your applications root module. We provide it at the component level
    // here, due to limitations of our example generation script.
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
  ],*/
})
export class Export2Component implements OnInit {
  reportTypeFormGroup: FormGroup;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  dataFormGroup: FormGroup;

  houses: House[] = [];
  types: ItemType[];

  loading = false;

  dataPreselected: number[] = [];

  locale: string;
  tzs: TimeZone[];
  cities: any[];
  comps: any[];

  constructor(
    private _formBuilder: FormBuilder,
    private houseService: HouseService,
    private housesService: HousesService,
    private route: ActivatedRoute,
    private dateAdapter: DateAdapter<Date>,
    public translate: TranslateService,
    public uiService: UIService,
  ) {
    this.locale = this.translate.currentLang;
    this.dateAdapter.setLocale(this.locale);
    this.dateAdapter.getFirstDayOfWeek = () => 1;

    const tzNames = moment.tz.names();
    this.tzs = tzNames.map((tzname) => {
      const offset = moment.tz(tzname).format('Z');
      return {
          title: `${tzname} (UTC${offset})`,
          offset: offset,
          value: tzname
        };
      });
  }

  ngOnInit() {
    this.loading = false;

    this.housesService.getCities().subscribe(data => {
      this.cities = data.results;
    });

    this.housesService.getCompanies().subscribe(data => {
      this.comps = data.results;
    });

    const date_from_d = new Date();
    date_from_d.setUTCDate(1);
    date_from_d.setUTCHours(0);
    date_from_d.setUTCMinutes(0);
    date_from_d.setUTCSeconds(0);
    date_from_d.setUTCMilliseconds(0);
    const date_to_d = new Date();
    date_to_d.setUTCHours(23);
    date_to_d.setUTCMinutes(59);
    date_to_d.setUTCSeconds(59);
    date_to_d.setUTCMilliseconds(0);

    const usrTz = moment.tz.guess();

    this.reportTypeFormGroup = this._formBuilder.group({
       reportType: ['idle', Validators.required],
    });

    this.firstFormGroup = this._formBuilder.group({
      city: [0],
      company: [0],
      projects: [[this.houseService.house.id], Validators.required],
    });
    this.secondFormGroup = this._formBuilder.group({
      date_from: [date_from_d, Validators.required],
      date_to: [date_to_d, Validators.required],
      timezone: [usrTz, Validators.required]
    });
    this.dataFormGroup = this._formBuilder.group({
      hide_null: [true],
      items: [[], Validators.required],
    });

    this.types = this.houseService.house.itemTypes;

    this.dataPreselected = this.route.snapshot.data['dataPreselected'];
    this.dataFormGroup.get('items').setValue(this.dataPreselected);
  }

  fillHouses(current_only: boolean, update: boolean = false): void {
    // console.log('aaa');

    let query = '';

    if (this.firstFormGroup.controls.city && this.firstFormGroup.controls.city.value) {
      query += '&city__id=' + this.firstFormGroup.controls.city.value;
    }

    if (this.firstFormGroup.controls.company && this.firstFormGroup.controls.company.value) {
      query += '&company__id=' + this.firstFormGroup.controls.company.value;
    }

    if (current_only) {
      this.firstFormGroup.controls.projects.setValue([this.houseService.house.id]);
    } else if (this.houses.length === 0 || update) {
      this.housesService.getHouses(1000, 0, 'title', query)
        .subscribe(data => {
          console.log(data);
          this.houses = data.results;
        });
    }
  }

  onSubmit(type: number): void {
    this.loading = true;

    const comp_name = this.comps.find(c => c.id === this.firstFormGroup.value.company);
    const city_name = this.cities.find(c => c.id === this.firstFormGroup.value.city);

    const ts_obj = {
      ts_from: +this.secondFormGroup.value.date_from,
      ts_to: +this.secondFormGroup.value.date_to,
      lang: this.uiService.getCurLang(),
      company_name: comp_name,
      city_name: city_name
    };

    const data: ExportConfig = Object.assign(this.firstFormGroup.value, ts_obj);

    let path = null;

    switch (this.reportTypeFormGroup.value.reportType) {
      case 'idle':
        path = 'excel_idle';
        break;
      case 'pouring':
        path = 'excel_pouring';
        break;
    }

    this.houseService.exportExcel(data, path).subscribe((response: HttpResponse<Blob>) => {
      this.loading = false;
      if (!response) {
        console.error('Fail to get excel');
        return;
      }

      // const contentDispositionHeader = response.headers.get('Content-Disposition');
      // const result = contentDispositionHeader.split(';')[1].trim().split('=')[1];

      const url = window.URL.createObjectURL(response.body);
      const anchor = document.createElement('a');
      anchor.style.display = 'none';
      // anchor.download = result.replace(/"/g, '');
      const df = moment(this.secondFormGroup.value.date_from).format('D MMM, YYYY');
      const dt = moment(this.secondFormGroup.value.date_to).format('D MMM, YYYY');
      anchor.download = this.translate.instant('REPORT_IDLE_FILENAME') + ' ' + df + '-' + dt + '.xlsx';
      anchor.href = url;
      anchor.dataset.downloadurl = ['text/plain', anchor.download, anchor.href].join(':');
      document.body.appendChild(anchor);
      anchor.click();

      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(url);
    });
 }

}
