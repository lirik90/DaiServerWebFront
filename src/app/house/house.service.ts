import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import {switchMap, catchError, map, tap, finalize, flatMap} from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

import { HouseDetail, ViewItem, Section, DeviceItem, Group, LogData, ParamValue, ParamItem } from './house';
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

  ts_from: Date;
  ts_to: Date;
  hide_null: boolean;
}

class DevValues {
  id: number;
  raw: any;
  display: any;
}

class StatusItems {
  connection: number;
  items: {
    args: any;
    group_id: number;
    id: number;
    status_id: number;
    title: string;
  }[];
}

@Injectable()
export class HouseService extends IHouseService {
  house: HouseDetail;

  private house_s = 'house';
  private devValuesInterval: any;
  private house2: HouseDetail;

  constructor(
          public translate: TranslateService,
          private router: Router,
          http: HttpClient,
          messageService: MessageService) {
    super( http, messageService );
    // this.house = JSON.parse(localStorage.getItem(this.house_s));
  }

  updateStatusItems(id: number): Observable<boolean> {
    // get dev values
    return this.http.get<StatusItems>(`/api/v2/project/${id}/status_item/`).pipe(
        switchMap(resp => {
      this.house2.conn = of(resp.connection);

      for (const s of this.house2.sections) {
        for (const g of s.groups) {
          g.statuses = [];

          resp.items.filter(item => item.group_id === g.id).map(item => {
            const stIns = this.house2.statuses.find(sti => sti.id === item.status_id);
            //const stType = this.house2.statusTypes.find(stt => stt.id === stIns.type_id);
            g.statuses.push({
              status: stIns,
              status_id: item.status_id,
              args: item.args
            });
          });

          this.calculateStatusInfo(g);
        }
      }
      return of(true);
    }), catchError(this.handleError('updateStatusItems', false)));
  }


  updateDevValues(id: number): Observable<boolean> {
    // get dev values
    return this.http.get<DevValues[]>(`/api/v2/project/${id}/devitem_values/`).pipe(
      switchMap(resp => {
      // console.log(resp);

      for (const s of this.house2.sections) {
        for (const g of s.groups) {
          for (const di of g.items) {
            const respItem = resp.find(i => i.id === di.id);

            if (respItem) {
              di.val.raw = respItem.raw;
              di.val.display = respItem.display;
            }
          }
        }
      }

      return of(true);
    }), catchError(this.handleError('updateDevValues', false)));
  }

  clear(): void {
    localStorage.removeItem(this.house_s);
    this.house = undefined;

    clearInterval(this.devValuesInterval);
  }

  loadHouse2(house_name: string, reload?: boolean): Observable<boolean> {
    return this.loadHouse(house_name, reload).pipe(
      flatMap((res) => {
        // returns an Observable of type Y
        return res ? this.updateStatusItems(this.house2.id) : of(false);
      }),
      flatMap((res) => {
        console.log(JSON.parse(JSON.stringify(this.house2.sections)));
        const udv = this.updateDevValues(this.house2.id);
        return res ? udv : of(false);
      }),
      flatMap((res) => {
        if (res) {
          this.house = this.house2;
          this.house.name = house_name;

          localStorage.setItem(this.house_s, JSON.stringify(this.house2));
          this.log('fetched house detail');

          return of(true);
        } else {
          return of(false);
        }
      }),
    );
  }

  loadHouse(house_name: string, reload?: boolean): Observable<boolean> {
    if (this.house && this.house.name == house_name && !reload) {
      return of(true);
    }

    this.house = undefined; // If comment need compare hash of detail

    const parse_param_value_childs = (group: Group, param_items: ParamItem[]) => {
      for (const param_value of group.params) {
        for (const param of param_items) {
          if (param.id === param_value.param_id) {
            param_value.param = param;
            break;
          }
        }
        if (param_value.param.parent_id) {
          for (const param_value2 of group.params) {
            if (param_value.param.parent_id == param_value2.param.id) {
              if (!param_value2.childs) {
                param_value2.childs = [];
              }
              param_value2.childs.push(param_value);
              break;
            }
          }
        }
      }

      for (let index = 0; index < group.params.length; ++index) {
        if (group.params[index].param.parent_id) {
          group.params.splice(index, 1);
          -- index;
        }
      }
    };

    let lang;
    const match = document.location.pathname.match(/\/(ru|en|fr|es)\//);
    if (match === null) {
      const browserLang = this.translate.getBrowserLang();
      lang = browserLang.match(/ru|en|fr|es/) ? browserLang : 'ru';
    } else {
      lang = match[1];
    }

    return this.get<HouseDetail>(`detail/?project_name=${house_name}&lang=${lang}`).pipe(
      switchMap(detail => {
        for (const param of detail.params) {
          if (param.parent_id) {
            for (const parent_param of detail.params) {
              if (parent_param.id === param.parent_id) {
                if (parent_param.childs == undefined) {
                  parent_param.childs = [];
                }
                parent_param.childs.push(param);
                break;
              }
            }
          }
        }

        for (const itemType of detail.itemTypes) {
          for (const sign of detail.signTypes) {
            if (sign.id === itemType.sign_id) {
              itemType.sign = sign;
              break;
            }
          }
        }

        for (const status of detail.statuses) {
          for (const status_type of detail.statusTypes) {
            if (status_type.id === status.type_id) {
              status.type = status_type;
              break;
            }
          }
        }

        const dev_items: DeviceItem[] = [];
        for (const dev of detail.devices) {
          for (const item of dev.items) {
            if (!item.val) {
              item.val = { raw: null, display: null};
            }

            for (const itemType of detail.itemTypes) {
              if (itemType.id === item.type_id) {
                item.type = itemType;
                break;
              }
            }
            dev_items.push(item);
          }
        }

        for (const sct of detail.sections) {
          for (const group of sct.groups) {
            for (const group_type of detail.groupTypes) {
              if (group_type.id === group.type_id) {
                group.type = group_type;
                break;
              }
            }

            if (group.items === undefined) {
              group.items = [];
            }

            for (const item of dev_items) {
              if (item.group_id === group.id) {
                group.items.push(item);
              }
            }

            for (const gsts of group.statuses) {
              for (const sts of detail.statuses) {
                if (sts.id == gsts.status_id) {
                  gsts.status = sts;
                  break;
                }
              }
            }
            this.calculateStatusInfo(group);
            parse_param_value_childs(group, detail.params);
          }
        }

        this.house2 = detail;
        this.house2.name = house_name;

        //localStorage.setItem(this.house_s, JSON.stringify(detail));
        //this.log('fetched house detail');

        // console.log(this.house);

        return of(true);
      }),
      catchError(this.handleError('checkCurrentHouse', false))
    );
  }

  public calculateStatusInfo(group: Group): void {
    const strings: string[] = [];
    let str;
    let color = 'green';
    let short_text = 'Ok';
    let last_error_level = 0;

    if (group.statuses === undefined) {
      group.statuses = [];
    }

    for (const sts of group.statuses) {
      if (sts.status.type_id > last_error_level) {
        last_error_level = sts.status.type_id;
        color = sts.status.type.color;
        short_text = sts.status.type.name;
      }
      str = sts.status.text;
      let l = sts.args ? sts.args.length : 0;
      while (l--) {
        str = str.replace('%' + (l + 1), sts.args[l]);
      }
      strings.push(str);
    }

    group.status_info = { color, short_text, text: strings.join('\n') };
  }

  public devItemById(item_id: number): DeviceItem {
    for (const dev of this.house.devices) {
      for (const dev_item of dev.items) {
        if (dev_item.id == item_id) {
          return dev_item;
        }
      }
    }
    return undefined;
  }

  url(name: string, id?: number): string {
    let url = name;
    if (id !== undefined) {
      url += '/' + id.toString();
    }
    return url + '/?id=' + this.house.id.toString();
  }

  getMembers(): Observable<PaginatorApi<TeamMember>> {
    return this.getPiped<PaginatorApi<TeamMember>>(this.url('team'), 'fetched team list', 'getMembers');
  }

  upload_file(item_id: number, file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('fileKey', file, file.name);

    const options = { headers: new HttpHeaders() };
    options.headers.append('Content-Type', 'multipart/form-data');

    const url = this.apiUrl + `write_item_file/?id=${this.house.id}&item_id=${item_id}`;
    return this.http.put(url, formData, options)
            .catch(error => Observable.throw(error));
  }

  getViewItems(view_id: number): Observable<PaginatorApi<ViewItem>> {
    return this.getPiped<PaginatorApi<ViewItem>>(this.url('viewitem') + `&limit=500&view_id=${view_id}`, `fetched ViewItem list`, 'getViewItems', {} as PaginatorApi<ViewItem>);
  }

  getLogs(date_from: number, date_to: number, group_type: number, itemtypes: string, items: string, limit: number = 1000, offset: number = 0): Observable<PaginatorApi<LogData>> {
    let url = this.url('log_data') + `&ts_from=${date_from}&ts_to=${+date_to}&limit=${limit}&offset=${offset}`;
    if (group_type !== undefined) {
      url += `&group_type=${group_type}`;
    }
    if (itemtypes !== undefined) {
      url += `&itemtypes=${itemtypes}`;
    }
    if (items !== undefined) {
      url += `&items=${items}`;
    }
    return this.getPiped<PaginatorApi<LogData>>(url, `fetched logs list`, 'getLogs');
  }

  exportExcel(conf: ExportConfig, path?: string): Observable<HttpResponse<Blob>> {
    if (!path) {
      path = 'excel';
    }

    const url = `/export/${path}/?id=${this.house.id}`;
    const opts = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      observe: 'response' as 'response',
      responseType: 'blob' as 'blob'
    };

    console.log(conf);

    return this.http.post(url, conf, opts).pipe(
      tap(_ => this.log('Export sucessfull')),
      catchError(this.handleError<HttpResponse<Blob>>('exportExcel', undefined))
    );
  }
}
