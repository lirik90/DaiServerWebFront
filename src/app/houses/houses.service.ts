import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

import { PaginatorApi, House } from '../user';
import { MessageService } from '../message.service';
import { IHouseService } from '../ihouse.service';

@Injectable()
export class HousesService extends IHouseService {
  private houseUrl = 'house/';  // URL to web api

  constructor(
          http: HttpClient,
          messageService: MessageService) {
    super( http, messageService );
  }

  getHouses(limit: number, page: number = 0, ordering: string = undefined): Observable<PaginatorApi<House>> {
    let url = this.houseUrl + `?limit=${limit}&offset=${limit * page}`;
    if (ordering && ordering.length)
      url += '&ordering=' + ordering;

    return this.getPiped<PaginatorApi<House>>( url, 
      `fetched client devices`, 'getHousees', {} as PaginatorApi<House>);
  }

  getHouse(id: number): Observable<House> {
    const url = `${this.houseUrl}${id}/`;
    return this.getPiped<House>(url, `fetched client device id=${id}`, `getHouse id=${id}`);
  }

  /** PUT: update the house on the server */
  updateHouse (house: House): Observable<any> {
    return this.putPiped(`${this.houseUrl}${house.id}/`, house, `updated client device id=${house.id}`, 'updateHouse');
  }

  /** POST: add a new house to the server */
  addHouse (house: House): Observable<House> {
    return this.postPiped<House>(this.houseUrl, house, `added client device w/ id=${house.id}`, 'addHouse');
  }

  /** DELETE: delete the house from the server */
  deleteHouse (house: House | number): Observable<House> {
    const id = typeof house === 'number' ? house : house.id;
    const url = `${this.houseUrl}${id}/`;

    return this.deletePiped<House>(url, `deleted client device id=${id}`, 'deleteHouse');
  }

  /* GET houses whose name contains search term */
  searchHouses(term: string): Observable<House[]> {
    if (!term.trim()) {
      // if not search term, return empty house array.
      return of([]);
    }
    const url = `${this.houseUrl}?search=${term}`;
    return this.getPiped<House[]>(url, `found houses matching "${term}"`, 'searchHouses', []);
  }
}
