import {Component, Inject, OnInit} from '@angular/core';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {HttpClient} from '@angular/common/http';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {Observable, of} from 'rxjs';
import {map, startWith, switchMap} from 'rxjs/operators';
import {CheckHeadStandDialogComponent} from '../check-head-stand/check-head-stand.component';

export class Brand {
  active = true;
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
  brands: Brand[] = [];
  producers: Producer[] = [];
  distributors: Distributor[] = [];
  producerControl: FormControl = new FormControl();
  filteredProducers: Observable<Producer[]>;
  brandControl: FormControl = new FormControl();
  filteredBrands: Observable<Brand[]>;
  distributorControl: FormControl = new FormControl();
  filteredDistributors: Observable<Distributor[]>;

  numbers: number[] = [];
  numbersControl: FormControl = new FormControl();
  filteredNumbers: Observable<number[]>;

  brandList: Observable<Brand[]>;

  brandControlS: FormControl = new FormControl();
  producerControlS: FormControl = new FormControl();
  distributorControlS: FormControl = new FormControl();
  numbersControlS: FormControl = new FormControl();

  constructor(
    public dialog: MatDialog,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.getProducers();
    this.getDistributors();
    this.getBrands();
    this.getNumbers();
  }

  getNumbers() {
    this.numbers = this.brands.map(b => b.id);
  }

  updateList() {
    let result = this.brands;

    if (this.brandControlS.value) {
      result = result.filter(b => b.id === this.brandControlS.value);
    }

    if (this.producerControlS.value) {
      result = result.filter(b => b.producer.id === this.producerControlS.value);
    }

    if (this.distributorControlS.value) {
      result = result.filter(b => b.distributor.id === this.distributorControlS.value);
    }

    if (this.numbersControlS.value) {
      result = result.filter(b => b.id === this.numbersControlS.value);
    }

    this.brandList = of(result);
  }

  updateFilteredNumbers() {
    this.filteredNumbers = this.numbersControl.valueChanges
      .pipe(
        startWith(''),
        map(n => parseInt(n, 10)),
        map(n => {
          if (!isNaN(n)) {
            console.log(n);
            return this.brands.filter(p => p.id === n).map(b => b.id);
          } else {
            console.log(n);
            return this.brands.map(b => b.id);
          }}
        )
      );
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
    this.http.get<List<Brand>>(`/api/v1/brand/`).subscribe(resp => {
      console.log(resp);
      this.brands = resp.results;
      this.updateFilteredBrands();
      this.updateFilteredNumbers();
      this.updateList();
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
      this.distributors = resp.results;
      this.updateFilteredDistributors();
    });
  }

  showEditDialog(b: Brand) {
    let b_copy = null;
    if (b) {
      b_copy = Object.assign({}, b);
    }

    const dialogRef = this.dialog.open(BrandEditDialogComponent, {
      data: {brand: b_copy, dists: this.distributors, prods: this.producers}, width: '80vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.result) {
        if (result.mode === 'edit') {
          Object.assign(b, result.result);
          this.updateBrand(result.result);
          this.updateList();
        } else if (result.mode === 'create') {
          this.createBrand(result.result);
        }
      }
    });
  }

  updateBrand(b: Brand) {
    const url = `/api/v1/brand2/${b.id}/`;
    const body = Object.assign({}, b) as any;
    body.producer = b.producer.id;
    body.distributor = b.distributor.id;

    this.http.put(url, body).subscribe(resp => {
        console.log(resp);
      },
      error => {
        console.log(error);
      });
  }

  createBrand(b: Brand) {
    const url = `/api/v1/brand2/`;
    const body = Object.assign({}, b) as any;
    body.id = undefined;
    body.producer = b.producer.id;
    body.distributor = b.distributor.id;

    this.http.post<Brand>(url, body).subscribe(resp => {
        console.log(resp);
        this.brands.push(resp);
        this.updateList();
      },
      error => {
        console.log(error);
      });
  }

  toggleActive(b: Brand) {
    b.active = !b.active;
    this.updateBrand(b);
  }

  showViewDialog(b: Brand) {
    const dialogRef = this.dialog.open(BrandViewDialogComponent, {
      data: {brand: b}, width: '80vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.result === 1) {
        const dialogRef2 = this.dialog.open(ConfirmEditDialogComponent, {
          data: {}});
        dialogRef2.afterClosed().subscribe(result2 => {
          if (result2.result === 1) {
            this.showEditDialog(b);
          }
        });
      }
    });
  }
}

@Component({
  selector: 'app-brand-edit-dialog',
  templateUrl: './brand-edit-dialog.html',
  styleUrls: ['./brands.component.css'],

})
export class BrandEditDialogComponent implements OnInit {
  curBrand: Brand;

  distributors: Distributor[];
  filteredDistributors: Observable<Distributor[]>;
  distributorControl: FormControl = new FormControl();
  producers: Producer[];
  filteredProducers: Observable<Producer[]>;
  producerControl: FormControl = new FormControl();
  curProducerId: number;
  curDistributorId: number;

  constructor(
    public dialogRef: MatDialogRef<BrandEditDialogComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data.brand) {
      this.curBrand = data.brand;
      this.curProducerId = this.curBrand.producer ? this.curBrand.producer.id : 0;
      this.curDistributorId = this.curBrand.distributor ? this.curBrand.distributor.id : 0;
    } else {
      this.curBrand = new Brand();
    }

    if (data.dists) {
      this.distributors = data.dists;
    } else {
      this.distributors = [];
    }

    if (data.prods) {
      this.producers = data.prods;
    } else {
      this.producers = [];
    }
  }

  ngOnInit(): void {
    this.updateFilteredProducers();
    this.updateFilteredDistributors();
  }

  close() {
    this.dialogRef.close({result: null});
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

  private updateFilteredDistributors() {
    this.filteredDistributors = this.distributorControl.valueChanges
      .pipe(
        startWith(''),
        map(name => name ? this.distributors.filter(p => p.name.includes(name)) : this.distributors.slice()
        )
      );
  }

  showDistribAddDialog() {
    const dialogRef = this.dialog.open(DistribAddDialogComponent, {
      data: {},
    });

    dialogRef.afterClosed().subscribe(resp => {
      if (resp.result) {
        this.curBrand.distributor = resp.result;
        this.distributors.push(resp.result);
        this.updateFilteredDistributors();
      }
    });
  }

  showProdAddDialog() {
    const dialogRef = this.dialog.open(ProdAddDialogComponent, {
      data: {},
    });

    dialogRef.afterClosed().subscribe(resp => {
      if (resp.result) {
        this.producers.push(resp.result);
        this.curBrand.producer = resp.result;
        this.updateFilteredProducers();
      }
    });
  }

  closeProducer() {
    this.producerControl.setValue('');
    if (this.curProducerId) {
      this.curBrand.producer = this.producers.find(p => p.id === this.curProducerId);
    } else {
      this.curBrand.producer = null;
    }
  }

  closeDistributor() {
    this.distributorControl.setValue('');
    if (this.curDistributorId) {
      this.curBrand.distributor = this.distributors.find(d => d.id === this.curDistributorId);
    } else {
      this.curBrand.distributor = null;
    }
  }

  save() {
    let bad = false;
    for (const field in this.curBrand) {
      if (!this.curBrand.hasOwnProperty(field) || field === 'id' || field === 'active') {
        continue;
      }
      if (!this.curBrand[field]) {
        bad = true;
        console.log(field);
        console.log(this.curBrand['field']);
        break;
      }
    }

    if (bad) {
      alert('Нужно заполнить все поля!');
    } else if (this.curBrand.id) {
        this.dialogRef.close({result: this.curBrand, mode: 'edit'});
      } else {
        this.dialogRef.close({result: this.curBrand, mode: 'create'});
      }
  }
}


@Component({
  selector: 'app-brand-view-dialog',
  templateUrl: './brand-view-dialog.html',
  styleUrls: ['./brands.component.css'],

})
export class BrandViewDialogComponent implements OnInit {
  curBrand: Brand;
  curProducerId: number;
  curDistributorId: number;

  constructor(
    public dialogRef: MatDialogRef<BrandEditDialogComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data.brand) {
      this.curBrand = data.brand;
      this.curProducerId = this.curBrand.producer ? this.curBrand.producer.id : 0;
      this.curDistributorId = this.curBrand.distributor ? this.curBrand.distributor.id : 0;
    } else {
      this.curBrand = new Brand();
    }
  }

  ngOnInit(): void {

  }

  close() {
    this.dialogRef.close({result: null});
  }

  edit() {
    this.dialogRef.close({result: 1});
  }
}

@Component({
  selector: 'app-confirm-edit-dialog',
  templateUrl: './confirm-edit-dialog.html',
  styleUrls: ['./brands.component.css'],

})
export class ConfirmEditDialogComponent implements OnInit {


  constructor(
    public dialogRef: MatDialogRef<BrandEditDialogComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

  }

  ngOnInit(): void {

  }

  close() {
    this.dialogRef.close({result: null});
  }

  onNoClick() {
    this.dialogRef.close({result: null});
  }

  onYesClick() {
    this.dialogRef.close({result: 1});
  }
}

@Component({
  selector: 'app-distrib-add-dialog',
  templateUrl: './distrib-add-dialog.html',
  styleUrls: ['./brands.component.css'],

})
export class DistribAddDialogComponent {
  frm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<BrandEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    private formBuilder: FormBuilder,
  ) {
    this.frm = this.formBuilder.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
    });
  }

  addNewDistributor() {
    if (this.frm.invalid) {
    } else {
      const url = '/api/v1/distributor/';
      const body = this.frm.value;
      this.http.post<Distributor>(url, body).subscribe(resp => {
          this.dialogRef.close({result: resp});
        },
        error => {
          console.log(error);
        });
    }
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
  frm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<BrandEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    private formBuilder: FormBuilder,
  ) {
    this.frm = this.formBuilder.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
    });
  }

  addNewProducer() {
    if (this.frm.invalid) {
    } else {
      const url = '/api/v1/producer/';
      const body = this.frm.value;
      this.http.post<Producer>(url, body).subscribe(resp => {
          this.dialogRef.close({result: resp});
      },
      error => {
        console.log(error);
      });
    }
  }

  close() {
    this.dialogRef.close({result: null});
  }
}

