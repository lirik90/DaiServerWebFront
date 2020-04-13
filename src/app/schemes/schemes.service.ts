import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

import { Scheme, PaginatorApi } from '../user';
import { MessageService } from '../message.service';
import { ISchemeService } from '../ischeme.service';

export interface Titled_Object
{
    id: number;
    title: string;
}

export interface SearchResult {
  count: number;
  next: string;
  previous: string;
  results: Scheme[];
}

export const nullSearchResult: SearchResult = {
  count: 0,
  next: null,
  previous: null,
  results: []
};

@Injectable()
export class SchemesService extends ISchemeService {

  constructor(
    http: HttpClient,
    messageService: MessageService) {
    super(http, messageService);
  }

    private v2_url = '/api/v2/';
    private v2_scheme_url = this.v2_url + 'scheme/';

  private schemeUrl = 'scheme/';  // URL to web api
  private cityUrl = 'city/';
  private compUrl = 'company/';

  getSchemes(limit: number, page: number = 0, ordering?: string, query?: string): Observable<PaginatorApi<Scheme>> {
    let url = this.schemeUrl + `?limit=${limit}&offset=${limit * page}`;
    if (ordering && ordering.length) {
      url += '&ordering=' + ordering;
    }

    if (query && query.length) {
      url += '&search=' + query;
    }

    return this.getPiped<PaginatorApi<Scheme>>(url,
      `fetched client devices`, 'getSchemes', {} as PaginatorApi<Scheme>);
  }

    get_parent_schemes(): Observable<Titled_Object[]>
    {
        const url = this.v2_scheme_url + '?parent_id=null';
        return this.http.get<Titled_Object[]>(url);
    }

  getCities(): Observable<PaginatorApi<any>> {
    const url = this.cityUrl;

    return this.getPiped<PaginatorApi<any>>(url,
      `fetched cities`, 'getCities', {} as PaginatorApi<Scheme>);
  }

  getCompanies(): Observable<PaginatorApi<any>> {
    const url = this.compUrl;

    return this.getPiped<PaginatorApi<any>>(url,
      `fetched cities`, 'getCities', {} as PaginatorApi<Scheme>);
  }

    setName(schemeId: number, name: string): Observable<any> {
        const url = `/api/v2/scheme/${schemeId}/set_name/`;
        return this.http.post<any>(url, {name});
    }

  getScheme(name: string): Observable<Scheme> {
    const url = `${this.schemeUrl}${name}/`;
    return this.getPiped<Scheme>(url, `fetched client device name=${name}`, `getScheme name=${name}`);
  }

  /** PUT: update the scheme on the server */
  updateScheme(scheme: Scheme): Observable<any> {
    return this.putPiped(`${this.schemeUrl}${scheme.name}/`, scheme, `updated client device id=${scheme.id}`, 'updateScheme');
  }

    /** POST: add a new scheme to the server */
    create_scheme(scheme: any): Observable<Scheme> {
        const url = this.v2_scheme_url;
        return this.http.post<Scheme>(url, scheme).catch((err: HttpErrorResponse) => {
            alert(err.error + '\n' + err.message);
            return of(null as Scheme);
        });
    }

  /** DELETE: delete the scheme from the server */
  deleteScheme(scheme: Scheme | number): Observable<Scheme> {
    const id = typeof scheme === 'number' ? scheme : scheme.id;
    const url = `${this.schemeUrl}${id}/`;

    return this.deletePiped<Scheme>(url, `deleted client device id=${id}`, 'deleteScheme');
  }

  /* GET schemes whose name contains search term */
  searchSchemes(term: string, next?: string): Observable<SearchResult> {
    if (!term.trim()) {
      // if not search term, return empty scheme array.
      return of(nullSearchResult);
    }
    const url = this.schemeUrl + (next ? next : `?search=${term}`);

    return this.getPiped<SearchResult>(url, `found schemes matching "${term}"`, 'searchSchemes', nullSearchResult);
  }
}
