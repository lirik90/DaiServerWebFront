import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subject }    from 'rxjs/Subject';
import { of }         from 'rxjs/observable/of';
import 'rxjs/add/operator/map';

import {
   debounceTime, distinctUntilChanged, switchMap
 } from 'rxjs/operators';

import { House } from '../../user';
import { HousesService } from '../houses.service';

@Component({
  selector: 'app-house-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class HouseSearchComponent implements OnInit {

  houses$: Observable<House[]>;
  private searchTerms = new Subject<string>();

  constructor(private housesService: HousesService) { }

  // Push a search term into the observable stream.
  search(term: string): void {
    this.searchTerms.next(term);
  }

  ngOnInit() {
    this.houses$ = this.searchTerms.pipe(
      // wait 300ms after each keystroke before considering the term
      debounceTime(300),

      // ignore new term if same as previous term
      distinctUntilChanged(),

      // switch to new search observable each time the term changes
      switchMap((term: string) => this.housesService.searchHouses(term).map((data: any) => data.results)),
    );
  }
}
