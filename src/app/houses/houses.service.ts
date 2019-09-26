import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';

import {House, PaginatorApi} from '../user';
import {MessageService} from '../message.service';
import {IHouseService} from '../ihouse.service';

export interface SearchResult {
  count: number;
  next: string;
  previous: string;
  results: House[];
}

export const nullSearchResult: SearchResult = {
  count: 0,
  next: null,
  previous: null,
  results: []
};

@Injectable()
export class HousesService extends IHouseService {

  constructor(
    http: HttpClient,
    messageService: MessageService) {
    super(http, messageService);
  }

  private houseUrl = 'house/';  // URL to web api
  private cityUrl = 'city/';
  private compUrl = 'company/';

  getHouses(limit: number, page: number = 0, ordering?: string, query?: string): Observable<PaginatorApi<House>> {
    let url = this.houseUrl + `?limit=${limit}&offset=${limit * page}`;
    if (ordering && ordering.length) {
      url += '&ordering=' + ordering;
    }

    if (query && query.length) {
      url += '&search=' + query;
    }

    return this.getPiped<PaginatorApi<House>>(url,
      `fetched client devices`, 'getHouses', {} as PaginatorApi<House>);
  }

  getCities(): Observable<PaginatorApi<any>> {
    const url = this.cityUrl;

    return this.getPiped<PaginatorApi<any>>(url,
      `fetched cities`, 'getCities', {} as PaginatorApi<House>);
  }

  getCompanies(): Observable<PaginatorApi<any>> {
    const url = this.compUrl;

    return this.getPiped<PaginatorApi<any>>(url,
      `fetched cities`, 'getCities', {} as PaginatorApi<House>);
  }

  getHouse(name: string): Observable<House> {
    const url = `${this.houseUrl}${name}/`;
    return this.getPiped<House>(url, `fetched client device name=${name}`, `getHouse name=${name}`);
  }

  /** PUT: update the house on the server */
  updateHouse(house: House): Observable<any> {
    return this.putPiped(`${this.houseUrl}${house.name}/`, house, `updated client device id=${house.id}`, 'updateHouse');
  }

  /** POST: add a new house to the server */
  addHouse(house: House): Observable<House> {
    return this.postPiped<House>(this.houseUrl, house, `added client device w/ id=${house.id}`, 'addHouse');
  }

  /** DELETE: delete the house from the server */
  deleteHouse(house: House | number): Observable<House> {
    const id = typeof house === 'number' ? house : house.id;
    const url = `${this.houseUrl}${id}/`;

    return this.deletePiped<House>(url, `deleted client device id=${id}`, 'deleteHouse');
  }

  /* GET houses whose name contains search term */
  searchHouses(term: string, next?: string): Observable<SearchResult> {
    if (!term.trim()) {
      // if not search term, return empty house array.
      return of(nullSearchResult);
    }
    const url = this.houseUrl + (next ? next : `?search=${term}`);

    return this.getPiped<SearchResult>(url, `found houses matching "${term}"`, 'searchHouses', nullSearchResult);
  }
}
