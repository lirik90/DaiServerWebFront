import {Component, Inject, OnInit} from '@angular/core';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {HttpClient} from '@angular/common/http';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

export class Brand {
  active: boolean;
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
          map(name => name ? this.producers.filter(p => p.name.includes(name)) : this.producers.slice()
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

