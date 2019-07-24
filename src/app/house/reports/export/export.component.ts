import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

//import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

import { ItemType, GroupType, Section, DeviceItem, Logs } from "../../house";
import { HouseService, ExportConfig, ExportItem } from "../../house.service";
import { HousesService } from '../../../houses/houses.service';
import { House } from "../../../user";
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.css'],
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
export class ExportComponent implements OnInit {
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  dataFormGroup: FormGroup;

  houses: House[] = [];
  types: ItemType[];

  loading: boolean = false;

  dataPreselected: number[] = [];

  constructor(
    private _formBuilder: FormBuilder,
    private houseService: HouseService,
    private housesService: HousesService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.loading = false;

    let date_from_d = new Date();
    date_from_d.setDate(1);
    date_from_d.setHours(0);
    date_from_d.setMinutes(0);
    date_from_d.setSeconds(0);
    date_from_d.setMilliseconds(0);
    let date_to_d = new Date();
    date_to_d.setHours(23);
    date_to_d.setMinutes(59);
    date_to_d.setSeconds(59);
    date_to_d.setMilliseconds(0);

    this.firstFormGroup = this._formBuilder.group({
      projects: [[this.houseService.house.id], Validators.required],
    });
    this.secondFormGroup = this._formBuilder.group({
      date_from: [date_from_d, Validators.required],
      date_to: [date_to_d, Validators.required],
    });
    this.dataFormGroup = this._formBuilder.group({
      hide_null: [true],
      items: [[], Validators.required],
    });

    this.types = this.houseService.house.itemTypes;

    this.dataPreselected = this.route.snapshot.data['dataPreselected'];
    this.dataFormGroup.get('items').setValue(this.dataPreselected);
  }

  fillHouses(current_only: boolean): void {
    if (current_only)
      this.firstFormGroup.controls.projects.setValue([this.houseService.house.id]);
    else if (this.houses.length === 0)
      this.housesService.getHouses(1000, 0, 'title')
        .subscribe(data => this.houses = data.results);
  }

  onSubmit(): void {
    this.loading = true;
    const data: ExportConfig = Object.assign(this.firstFormGroup.value, this.secondFormGroup.value, this.dataFormGroup.value);
    this.houseService.exportExcel(data).subscribe((response: HttpResponse<Blob>) => {
      this.loading = false;
      if (!response)
      {
        console.error("Fail to get excel");
        return;
      }

      let contentDispositionHeader = response.headers.get('Content-Disposition');
      let result = contentDispositionHeader.split(';')[1].trim().split('=')[1];

      let url = window.URL.createObjectURL(response.body);
      let anchor = document.createElement('a');
      anchor.style.display = "none";
      anchor.download = result.replace(/"/g, '');
      anchor.href = url;
      anchor.dataset.downloadurl = ['text/plain', anchor.download, anchor.href].join(':');
      document.body.appendChild(anchor);
      anchor.click();

      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(url);
      //window.open(url);
    });
 }
}
