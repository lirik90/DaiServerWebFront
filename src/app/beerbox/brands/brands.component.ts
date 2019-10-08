import {Component, Inject, OnInit} from '@angular/core';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {ConfirmDialogReplaceKegComponent, CUSTOM_FORMATS} from '../replace-keg/replace-keg.component';
import {filter} from 'rxjs/operators';
import {HouseService} from '../../house/house.service';
import {ControlService} from '../../house/control.service';

export class Brand {
  name: string;
  alc: string;
  ings: string;
  nutr: string;
  info: string;
  barcode: string;

  constructor() {

  }
}

@Component({
  selector: 'app-brands',
  templateUrl: './brands.component.html',
  styleUrls: ['./brands.component.css']
})
export class BrandsComponent implements OnInit {
  brands: Brand[] = [];

  constructor(
    public dialog: MatDialog,
    private houseService: HouseService,
    private controlService: ControlService
  ) { }

  ngOnInit() {
    this.mockBrands();
  }

  mockBrands() {
    const b = new Brand();
    b.name = 'Brand name';
    b.alc = '4';
    b.ings = 'Ingridient 1, ingridient 2';
    b.nutr = '48 cal'
    b.info = 'test info';
    b.barcode = '1234567890123';

    this.brands.push(b);
  }

  addBrand() {
    this.dialog.open(BrandEditDialogComponent, {width: '80%', data: { brand: null }})
      .afterClosed().pipe(
      filter(name => name)
    ).subscribe(res => {
      console.log(res.result);

      if (res.result != null) {
        this.brands.push(res.result);
      }
    });
  }

  remove(b: Brand) {
    this.brands = this.brands.filter(bs => bs !== b);
  }

  edit(b: Brand) {
    this.dialog.open(BrandEditDialogComponent, {width: '80%', data: { brand: b }})
      .afterClosed().pipe(
      filter(name => name)
    ).subscribe(res => {
      console.log(res.result);

      if (res.result != null) {
        b = res.result;
      }
    });
  }
}


@Component({
  selector: 'app-brand-edit-dialog',
  templateUrl: './brand-edit-dialog.html',
  styleUrls: ['./brands.component.css'],

})
export class BrandEditDialogComponent {
  curBrand: Brand;

  constructor(
    public dialogRef: MatDialogRef<BrandEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data.brand === null) {
      this.curBrand = new Brand();
    } else {
      this.curBrand = data.brand;
    }
  }

  save() {
    this.dialogRef.close({result: this.curBrand});
  }

  close() {
    this.dialogRef.close({result: null});
  }
}

