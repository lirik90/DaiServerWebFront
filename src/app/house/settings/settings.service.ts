import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { catchError, map, tap } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

import { HouseService } from '../house.service';
import { Section } from '../house';

@Injectable()
export class SettingsService {
  private readonly sct_s: string = 'section/';

  constructor(
    private hServ: HouseService
  ) {}

  getSection(id: number): Observable<Section> {
    const url = this.hServ.url(this.sct_s, id);
    return this.hServ.getPiped<Section>(url, `fetched section id=${id}`, `getSection id=${id}`);
  }

  /** PUT: update the house on the server */
  updateSection (sct: Section): Observable<any> {
    const url = this.hServ.url(this.sct_s, sct.id);
    return this.hServ.putPiped(url, sct, `updated section id=${sct.id}`, 'updateSection');
  }

  /** POST: add a new house to the server */
  addSection (sct: Section): Observable<Section> {
    const url = this.hServ.url(this.sct_s);
    return this.hServ.postPiped<Section>(url, sct, `added section w/ id=${sct.id}`, 'addSection');
  }

  /** DELETE: delete the house from the server */
  deleteSection (sct: Section | number): Observable<Section> {
    const id = typeof sct === 'number' ? sct : sct.id;
    const url = this.hServ.url(this.sct_s, id);

    return this.hServ.deletePiped<Section>(url, `deleted section id=${id}`, 'deleteSection');
  }
}
