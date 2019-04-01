import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { switchMap, catchError, map, tap, finalize } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

import { HouseDetail, Section, DeviceItem, Group, Logs } from './house';
import { TeamMember, PaginatorApi } from '../user';
import { MessageService } from '../message.service';
import { IHouseService } from '../ihouse.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

export interface ExportItem {
  id: number;
}
export interface ExportConfig {
  projects: number[];
  items: ExportItem[];

  date_from: Date;
  date_to: Date;
  hide_null: boolean;
}

@Injectable()
export class HouseService extends IHouseService {
  house: HouseDetail;

  private house_s = 'house';

  constructor(
          http: HttpClient,
          messageService: MessageService) 
  { 
    super( http, messageService );
    // this.house = JSON.parse(localStorage.getItem(this.house_s));
  }

  clear(): void {
    localStorage.removeItem(this.house_s);
    this.house = undefined;
  }

  loadHouse(house_name: string): Observable<boolean> {
    if (this.house && this.house.name == house_name)
      return of(true);

    this.house = undefined; // If comment need compare hash of detail

    return this.get<HouseDetail>(`detail/?project_name=${house_name}`).pipe(
      switchMap(detail => {
        for (let param of detail.params) {
          if (param.parent_id) {
            for (let parent_param of detail.params) {
              if (parent_param.id === param.parent_id) {
                if (parent_param.childs == undefined)
                  parent_param.childs = [];
                parent_param.childs.push(param);
                break;
              }
            }
          }
        }

        for (let itemType of detail.itemTypes) {
          for (let sign of detail.signTypes) {
            if (sign.id === itemType.sign_id) {
              itemType.sign = sign;
              break;
            }
          }
        }

        let dev_items: DeviceItem[] = [];
        for (let dev of detail.devices) {
          for (let item of dev.items) {
            for (let itemType of detail.itemTypes) {
              if (itemType.id === item.type_id) {
                item.type = itemType;
                break;
              }
            }
            dev_items.push(item);
          }
        }

        for (let sct of detail.sections) {
          for (let group of sct.groups) {
            for (let group_type of detail.groupTypes) {
              if (group_type.id === group.type_id)
              {
                group.type = group_type;
                break;
              }
            }

            if (group.items === undefined)
              group.items = [];

            for (let item of dev_items) {
              if (item.group_id === group.id)
                group.items.push(item);
            }

            for (let param_val of group.params) {
              for (let param of detail.params) {
                if (param.id === param_val.param_id) {
                  param_val.param = param;
                  break;
                }
              }
            }
          }
        }

        this.house = detail;
        localStorage.setItem(this.house_s, JSON.stringify(detail));
        this.log('fetched house detail'); 
        return of(true);
      }),
      catchError(this.handleError('checkCurrentHouse', false))
    );
  }

  public devItemById(item_id: number): DeviceItem {
    for (let dev of this.house.devices) {
      for (let dev_item of dev.items) {
        if (dev_item.id == item_id)
          return dev_item;
      }
    }
    return undefined;
  }

  url(name: string, id?: number): string {
    let url = name;
    if (id !== undefined)
      url += '/' + id.toString();
    return url + '/?id=' + this.house.id.toString();
  }

  getMembers(): Observable<PaginatorApi<TeamMember>>
  {
    return this.getPiped<PaginatorApi<TeamMember>>(this.url('team'), 'fetched team list', 'getMembers');
  }
	
  upload_file(item_id: number, file: File): Observable<any>
  {
    const formData: FormData = new FormData();
    formData.append('fileKey', file, file.name);
    
    let options = { headers: new HttpHeaders() };
    options.headers.append('Content-Type', 'multipart/form-data');
    
    const url = this.apiUrl + `write_item_file/?id=${this.house.id}&item_id=${item_id}`;
    return this.http.put(url, formData, options)
            .catch(error => Observable.throw(error));
  }

  getLogs(date_from: string, date_to: string, group_type: number, itemtypes: string, items: string, limit: number = 1000, offset: number = 0): Observable<PaginatorApi<Logs>> {
    let url = this.url('logs') + `&date_from=${date_from}&date_to=${date_to}&limit=${limit}&offset=${offset}`;
    if (group_type !== undefined)
      url += `&group_type=${group_type}`;
    if (itemtypes !== undefined)
      url += `&itemtypes=${itemtypes}`;
    if (items !== undefined)
      url += `&items=${items}`;
    return this.getPiped<PaginatorApi<Logs>>(url, `fetched logs list`, 'getLogs');
  }

  exportExcel(conf: ExportConfig): Observable<HttpResponse<Blob>> 
  {
    const url = `/export/excel/?id=${this.house.id}`;
    const opts = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      observe: 'response' as 'response',
      responseType: 'blob' as 'blob'
    };
    
    return this.http.post(url, conf, opts).pipe(
      tap(_ => this.log('Export sucessfull')),
      catchError(this.handleError<HttpResponse<Blob>>('exportExcel', undefined))
    );
  }
}
