import {Component, Inject, OnInit} from '@angular/core';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {HttpClient} from '@angular/common/http';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {Observable, of} from 'rxjs';
import {map, startWith, switchMap} from 'rxjs/operators';
import {CheckHeadStandDialogComponent} from '../check-head-stand/check-head-stand.component';
import {TranslateService} from '@ngx-translate/core';
import {Select2OptionData} from 'ng-select2';

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
  filteredProducers: Array<Select2OptionData>;
  filteredBrands: Array<Select2OptionData>;
  filteredDistributors: Array<Select2OptionData>;

  numbers: number[] = [];
  filteredNumbers: Array<Select2OptionData>;

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

    this.producerControlS.valueChanges.subscribe(v => {
      this.updateList();
    });

    this.distributorControlS.valueChanges.subscribe(v => {
      this.updateList();
    });

    this.brandControlS.valueChanges.subscribe(v => {
      this.updateList();
    });

    this.numbersControlS.valueChanges.subscribe(v => {
      this.updateList();
    });
  }

  getNumbers() {
    this.numbers = this.brands.map(b => b.id);
  }

  updateList() {
    let result = this.brands;

    if (this.brandControlS.value) {
      result = result.filter(b => b.id === parseInt(this.brandControlS.value, 10));
    }

    if (this.producerControlS.value) {
      result = result.filter(b => b.producer.id === parseInt(this.producerControlS.value, 10));
    }

    if (this.distributorControlS.value) {
      result = result.filter(b => b.distributor.id === parseInt(this.distributorControlS.value, 10));
    }

    if (this.numbersControlS.value) {
      result = result.filter(b => b.id === parseInt(this.numbersControlS.value, 10));
    }

    this.brandList = of(result);

    this.updateFilteredProducers(result);
    this.updateFilteredBrands(result);
    this.updateFilteredDistributors(result);
    this.updateFilteredNumbers(result);
  }

  updateFilteredNumbers(blist?: Brand[]) {
    let src = [];

    if (!blist) {
      src = this.numbers;
    } else {
      for (const b of blist) {
        if (!src.includes(b.id)) {
          src.push(b.id);
        }
      }
    }

    this.filteredNumbers = src.map(p => {
      return {
        id: p.toString(),
        text: p.toString(),
      } as Select2OptionData;
    });
  }

  private updateFilteredProducers(blist?: Brand[]) {
    let src = [];

    if (!blist) {
      src = this.producers;
    } else {
      for (const b of blist) {
        if (!src.includes(b.producer)) {
          src.push(b.producer);
        }
      }
    }

    this.filteredProducers = src.map(p => {
      return {
        id: p.id.toString(),
        text: p.name
      } as Select2OptionData;
    });
  }

  private getProducers() {
    this.http.get<List<Producer>>(`/api/v1/producer/`).subscribe(resp => {
      this.producers = resp.results;
      this.updateFilteredProducers();
    });
  }

  private updateFilteredBrands(blist?: Brand[]) {
    let src = [];

    if (!blist) {
      src = this.brands;
    } else {
      src = blist;
    }

    this.filteredBrands = this.brands.map(p => {
      return {
        id: p.id.toString(),
        text: p.name
      } as Select2OptionData;
    });
  }

  private getBrands() {
    this.http.get<List<Brand>>(`/api/v1/brand/`).subscribe(resp => {
      console.log(resp);
      this.brands = resp.results;
      this.updateFilteredBrands();
      this.getNumbers(); 1;
      this.updateFilteredNumbers();
      this.updateList();
    });
  }

  private updateFilteredDistributors(blist?: Brand[]) {
    let src = [];

    if (!blist) {
      src = this.distributors;
    } else {
      for (const b of blist) {
        if (!src.includes(b.distributor)) {
          src.push(b.distributor);
        }
      }
    }

    this.filteredDistributors = src.map(p => {
      return {
        id: p.id.toString(),
        text: p.name
      } as Select2OptionData;
    });
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
      data: {brand: b_copy, dists: this.distributors, prods: this.producers, brands: this.brands}, width: '80vw', disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.result) {
        this.producers = result.p;
        this.distributors = result.d;
        this.updateFilteredDistributors();
        this.updateFilteredProducers();

        if (result.mode === 'edit') {
          Object.assign(b, result.result);
          this.updateBrand(result.result);
          this.updateList();
        } else if (result.mode === 'create') {
          this.createBrand(result.result);
        }
      }

      if (result && result.mode === 'edit') {
        this.showViewDialog(b);
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
        this.brands.push(b);
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
      if (result && result.result === 1) {
        const dialogRef2 = this.dialog.open(ConfirmEditDialogComponent, {
          data: {text: 'Действительно хотите произвести редактирование данных бренда?', ybtn: 'Редактировать', nbtn: 'Отмена'}});
        dialogRef2.afterClosed().subscribe(result2 => {
          if ( result && result2.result === 1) {
            this.showEditDialog(b);
          }
        });
      }
    });
  }

  clear() {
    this.numbersControlS.setValue('');
    this.producerControlS.setValue('');
    this.distributorControlS.setValue('');
    this.brandControlS.setValue('');
    this.updateList();
  }
}

@Component({
  selector: 'app-brand-edit-dialog',
  templateUrl: './brand-edit-dialog.html',
  styleUrls: ['./brands.component.css'],

})
export class BrandEditDialogComponent implements OnInit {
  curBrand: Brand;
  brands: Brand[];

  distributors: Distributor[];
  filteredDistributors: Observable<Distributor[]>;
  distributorControl: FormControl = new FormControl();
  producers: Producer[];
  filteredProducers: Array<Select2OptionData>;
  producerControl: FormControl = new FormControl();
  curProducerId: number;
  curDistributorId: number;
  fbrands: Observable<Brand[]>;
  nameCtrl = new FormControl('');

  constructor(
    public dialogRef: MatDialogRef <BrandEditDialogComponent>,
    public dialog: MatDialog,
    public translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data.brand) {
      this.curBrand = data.brand;
      this.curProducerId = this.curBrand.producer ? this.curBrand.producer.id : 0;
      this.curDistributorId = this.curBrand.distributor ? this.curBrand.distributor.id : 0;
      this.nameCtrl.setValue(this.curBrand.name);
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

    if (data.brands) {
      this.brands = data.brands;
    } else {
      this.brands = [];
    }

    this.fbrands = this.nameCtrl.valueChanges
      .pipe(
        startWith(''),
        map(name => {
          // console.log(name);

          if (this.curBrand.id || name.length === 0) {
            return [];
          }

          return name ? this.brands.filter(b => b.name.includes(name)) : this.brands.slice();
        })
      );

    this.nameCtrl.valueChanges.subscribe(v => {
      this.curBrand.name = v;
    });
  }

  ngOnInit(): void {
    this.updateFilteredProducers();
    this.updateFilteredDistributors();
  }

  close() {
    const dialogRef2 = this.dialog.open(ConfirmEditDialogComponent, {
      data: {text: this.translate.instant('BRANDS.CONFIRM_CANCEL'), ybtn: this.translate.instant('BRANDS.CANCEL'), nbtn: this.translate.instant('BRANDS.CONTINUE')}});
    dialogRef2.afterClosed().subscribe(result2 => {
      if (result2.result === 1) {
        if (this.curBrand.id) {
          this.dialogRef.close({result: null, mode: 'edit', d: this.distributors, p: this.producers});
        } else {
          this.dialogRef.close({result: null, mode: 'create', d: this.distributors, p: this.producers});
        }
      }
    });
  }

  private updateFilteredProducers() {
    this.filteredProducers = this.producers.map(p => {
      return {
          id: p.id.toString(),
          text: p.name
        } as Select2OptionData;
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

  showDistribAddDialog() {
    const dialogRef = this.dialog.open(DistribAddDialogComponent, {
      data: {}, width: '80vw'
    });

    dialogRef.afterClosed().subscribe(resp => {
      if (resp && resp.result) {
        this.distributors.push(resp.result);
        this.updateFilteredDistributors();
      }
    });
  }

  showProdAddDialog() {
    const dialogRef = this.dialog.open(ProdAddDialogComponent, {
      data: {}, width: '80vw'
    });

    dialogRef.afterClosed().subscribe(resp => {
      if (resp && resp.result) {
        this.producers.push(resp.result);
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
    let badExists = false;
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

    if (this.brands.find(b => b.barcode == this.curBrand.barcode && b.id != this.curBrand.id)) {
      badExists = true;
    }

    if (bad) {
      alert(this.translate.instant('BRANDS.REQ_FIELDS'));
    }
    if (badExists) {
      alert(this.translate.instant('BRANDS.BARCODE_DUP'));
    } else if (this.curBrand.id) {
      this.dialogRef.close({result: this.curBrand, mode: 'edit', d: this.distributors, p: this.producers});
    } else {
      this.dialogRef.close({result: this.curBrand, mode: 'create', d: this.distributors, p: this.producers});
    }
  }

  doFilter() {

  }

  showExists(v: any) {
    // console.log(v);
    const optId = v.id;
    const optEl = document.getElementById(optId);
    const dataId = parseInt(optEl.getAttribute('data-bid'), 10);
    console.log(dataId);

    const b = this.brands.find(br => br.id === dataId);

    if (!b) {
      return;
    }

    const dialogRef = this.dialog.open(BrandViewDialogComponent, {
      data: {brand: b, ybtn: this.translate.instant('BRANDS.CONTINUE_CREATE')}, width: '80vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.result === 1) {
        console.log('yey');
      } else {
        this.close();
      }
    });
  }

  limitnumber(target: HTMLInputElement) {
    let val = parseFloat(target.value);
    const max = parseFloat(target.getAttribute('max'));
    const min = parseFloat(target.getAttribute('min'));
    if (val > max) {
      val = max;
    }
    if (val < min) {
      val = min;
    }
    target.value = val.toString();
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
  ybtn: string;

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

    if (data.ybtn) {
      this.ybtn = data.ybtn;
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
  text: string;
  ybtn: string;
  nbtn: string;

  constructor(
    public dialogRef: MatDialogRef<BrandEditDialogComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.text = data.text;
    this.ybtn = data.ybtn;
    this.nbtn = data.nbtn;
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

