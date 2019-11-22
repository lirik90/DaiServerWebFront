import {Component, Inject, OnInit} from '@angular/core';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {HttpClient} from '@angular/common/http';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith, switchMap} from 'rxjs/operators';
import {CheckHeadStandDialogComponent} from '../check-head-stand/check-head-stand.component';

export class Brand {
  active: boolean = true;
  alc: string;
  barcode: string;
  distributor: Distributor;
  id: number;
  ingredients: string;
  more_details: string;
  name: string;
  pressure: any;
  producer: Producer;
  storage_condition: string;

  constructor() {
    this.active = true;
    this.alc = '';
    this.barcode = '';
    this.distributor = null;
    this.id = 0;
    this.ingredients = '';
    this.more_details = '';
    this.name = '';
    this.pressure = null;
    this.producer = null;
    this.storage_condition = '';
  }
}

export class List<T> {
  count: number;
  next: string;
  previous: string;
  results: T[];
}

export class Producer {
  address: string;
  id: number;
  name: string;
}

export class Distributor {
  id: number;
  name: string;
  address: string;
}

@Component({
  selector: 'app-brands',
  templateUrl: './brands.component.html',
  styleUrls: ['./brands.component.css']
})
export class BrandsComponent implements OnInit {
  brands: any[] = [];
  producers: Producer[] = [];
  distributors: any[] = [];
  producerControl: FormControl = new FormControl();
  filteredProducers: Observable<Producer[]>;
  brandControl: FormControl = new FormControl();
  filteredBrands: Observable<Brand[]>;
  distributorControl: FormControl = new FormControl();
  filteredDistributors: Observable<Brand[]>;

  constructor(
    public dialog: MatDialog,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.getProducers();
    this.updateFilteredProducers();

    this.getBrands();
    this.updateFilteredBrands();

    this.getDistributors();
    this.updateFilteredDistributors();
  }

  private updateFilteredProducers() {
    this.filteredProducers = this.producerControl.valueChanges
      .pipe(
          startWith(''),
          map(name => {
            if (name) {
              return this.producers.filter(p => p.name.includes(name));
            } else {
              return this.producers.slice();
            }
          }
        )
      );
  }

  private getProducers() {
    this.http.get<List<Producer>>(`/api/v1/producer/`).subscribe(resp => {
      this.producers = resp.results;
      this.updateFilteredProducers();
    });
  }

  private updateFilteredBrands() {
    this.filteredBrands = this.brandControl.valueChanges
      .pipe(
        startWith(''),
        map(name => name ? this.brands.filter(p => p.name.includes(name)) : this.brands.slice()
        )
      );
  }

  private getBrands() {
    this.http.get<List<Producer>>(`/api/v1/brand/`).subscribe(resp => {
      console.log(resp);
      this.brands = resp.results;
      this.updateFilteredBrands();
    });
  }

  private updateFilteredDistributors() {
    this.filteredDistributors = this.distributorControl.valueChanges
      .pipe(
        startWith(''),
        map(name => name ? this.distributors.filter(p => p.name.includes(name)) : this.distributors.slice()
        )
      );
  }

  private getDistributors() {
    this.http.get<List<Producer>>(`/api/v1/distributor/`).subscribe(resp => {
      console.log(resp);
      this.distributors = resp.results;
      this.updateFilteredDistributors();
    });
  }

  showEditDialog(b: Brand) {
    const dialogRef = this.dialog.open(BrandEditDialogComponent, {
      data: {brand: b}, width: '80vw'
    });

    dialogRef.afterClosed().subscribe(result => console.log(result));
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
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data.brand) {
      this.curBrand = data.brand;
    } else {
      this.curBrand = new Brand();
    }
  }

  close() {
    this.dialogRef.close({result: null});
  }

  showDistribAddDialog() {
    const dialogRef = this.dialog.open(DistribAddDialogComponent, {
      data: {},
    });

    dialogRef.afterClosed().subscribe(result => console.log(result));
  }

  showProdAddDialog() {
    const dialogRef = this.dialog.open(ProdAddDialogComponent, {
      data: {},
    });

    dialogRef.afterClosed().subscribe(result => console.log(result));
  }
}

@Component({
  selector: 'app-distrib-add-dialog',
  templateUrl: './distrib-add-dialog.html',
  styleUrls: ['./brands.component.css'],

})
export class DistribAddDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<BrandEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

  }

  close() {
    this.dialogRef.close({result: null});
  }
}

@Component({
  selector: 'app-prod-add-dialog',
  templateUrl: './prod-add-dialog.html',
  styleUrls: ['./brands.component.css'],

})
export class ProdAddDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<BrandEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  close() {
    this.dialogRef.close({result: null});
  }
}

