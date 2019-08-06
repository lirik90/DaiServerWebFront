import {Component, OnInit} from '@angular/core';

import {Subject} from 'rxjs/Subject';
import 'rxjs/add/operator/map';

import {debounceTime, distinctUntilChanged} from 'rxjs/operators';

import {House} from '../../user';
import {HousesService} from '../houses.service';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-house-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class HouseSearchComponent implements OnInit {
  private searchTerms = new Subject<string>();

  houses: House[] = [];

  constructor(private housesService: HousesService,
              protected http: HttpClient) {
  }

  // Push a search term into the observable stream.
  search(term: string): void {
    this.searchTerms.next(term);
  }

  recursiveSearch(query: string, next?: string) {
    this.housesService.searchHouses(query, next).subscribe((resp) => {
      this.houses = this.houses.concat(resp.results); // append houses

      if (resp.next) { // if has next
        const nextUrl = new URL(resp.next);
        const nextQuery = nextUrl.search; // ?search=[QUERY]&limit=35&offset=[XX]

        this.recursiveSearch(nextQuery, nextQuery);
      }
    });
  }

  ngOnInit() {
    this.searchTerms.pipe(
      // wait 300ms after each keystroke before considering the term
      debounceTime(300),

      // ignore new term if same as previous term
      distinctUntilChanged(),
    ).subscribe((term) => {
      this.houses = []; // new search!
      this.recursiveSearch(term);
    });
  }
}
