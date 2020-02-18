import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import {switchMap, catchError, map, tap, finalize, flatMap} from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

import { Scheme_Detail, Section, Device_Item, Device_Item_Group, Log_Data, DIG_Param_Value, DIG_Param_Type } from './scheme';
import { Scheme_Group_Member, PaginatorApi } from '../user';
import { MessageService } from '../message.service';
import { ISchemeService } from '../ischeme.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

export interface ExportItem {
  id: number;
}
export interface ExportConfig {
  schemes: number[];
  items: ExportItem[];

  ts_from: Date;
  ts_to: Date;
  hide_null: boolean;
}

class DevValues {
  id: number;
  raw_value: any;
  value: any;
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
export class SchemeService extends ISchemeService {
  scheme: Scheme_Detail;

  private scheme_s = 'scheme';
  private devValuesInterval: any;
  private scheme2: Scheme_Detail;

  constructor(
          public translate: TranslateService,
          private router: Router,
          http: HttpClient,
          messageService: MessageService) {
    super( http, messageService );
    // this.scheme = JSON.parse(localStorage.getItem(this.scheme_s));
  }

  updateStatusItems(id: number): Observable<boolean> {
    // get dev values
    return this.http.get<StatusItems>(`/api/v2/scheme/${id}/dig_status/`).pipe(
        switchMap(resp => {
      this.scheme2.conn = of(resp.connection);

      for (const s of this.scheme2.section) {
        for (const g of s.groups) {
          g.statuses = [];

          resp.items.filter(item => item.group_id === g.id).map(item => {
            const stIns = this.scheme2.dig_status_type.find(sti => sti.id === item.status_id);
            //const stType = this.scheme2.statusTypes.find(stt => stt.id === stIns.type_id);
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
    return this.http.get<DevValues[]>(`/api/v2/scheme/${id}/device_item_value/`).pipe(
      switchMap(resp => {
      // console.log(resp);

      for (const s of this.scheme2.section) {
        for (const g of s.groups) {
          for (const di of g.items) {
            const respItem = resp.find(i => i.id === di.id);

            if (respItem) {
              di.val.raw_value = respItem.raw_value;
              di.val.value = respItem.value;
            }
          }
        }
      }

      return of(true);
    }), catchError(this.handleError('updateDevValues', false)));
  }

  clear(): void {
    localStorage.removeItem(this.scheme_s);
    this.scheme = undefined;

    clearInterval(this.devValuesInterval);
  }

  reloadScheme(scheme_name: string): Observable<boolean> {
    return this.loadScheme(scheme_name, true).pipe(
      flatMap((res) => {
        if (res) {
          this.scheme = this.scheme2;
          this.scheme.name = scheme_name;

          localStorage.setItem(this.scheme_s, JSON.stringify(this.scheme2));
          this.log('fetched scheme detail');

          return of(true);
        } else {
          return of(false);
        }
      }),
    );
  }

  loadScheme2(scheme_name: string, reload?: boolean): Observable<boolean> {
    return this.loadScheme(scheme_name, reload).pipe(
      flatMap((res) => {
        // returns an Observable of type Y
        return res ? this.updateStatusItems(this.scheme2.id) : of(false);
      }),
      flatMap((res) => {
        console.log(JSON.parse(JSON.stringify(this.scheme2.section)));
        const udv = this.updateDevValues(this.scheme2.id);
        return res ? udv : of(false);
      }),
      flatMap((res) => {
        if (res) {
          this.scheme = this.scheme2;
          this.scheme.name = scheme_name;

          localStorage.setItem(this.scheme_s, JSON.stringify(this.scheme2));
          this.log('fetched scheme detail');

          return of(true);
        } else {
          return of(false);
        }
      }),
    );
  }

  loadScheme(scheme_name: string, reload?: boolean): Observable<boolean> {
    if (this.scheme && this.scheme.name == scheme_name && !reload) {
      return of(true);
    }

    this.scheme = undefined; // If comment need compare hash of detail

    const parse_param_value_childs = (group: Device_Item_Group, param_items: DIG_Param_Type[]) => {
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

    return this.get<Scheme_Detail>(`detail/?name=${scheme_name}&lang=${lang}`).pipe(
      switchMap(detail => {
        for (const param of detail.dig_param_type) {
          if (param.parent_id) {
            for (const parent_param of detail.dig_param_type) {
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

        for (const itemType of detail.device_item_type) {
          for (const sign of detail.sign_type) {
            if (sign.id === itemType.sign_id) {
              itemType.sign = sign;
              break;
            }
          }
        }

        for (const status_type of detail.dig_status_type) {
          for (const status_category of detail.dig_status_category) {
            if (status_category.id === status_type.category_id) {
              status_type.category = status_category;
              break;
            }
          }
        }

        const dev_items: Device_Item[] = [];
        for (const dev of detail.device) {
          for (const item of dev.items) {
            if (!item.val) {
              item.val = { raw_value: null, value: null};
            }

            for (const itemType of detail.device_item_type) {
              if (itemType.id === item.type_id) {
                item.type = itemType;
                break;
              }
            }
            dev_items.push(item);
          }
        }

        for (const sct of detail.section) {
          for (const group of sct.groups) {
            for (const group_type of detail.dig_type) {
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
              for (const sts of detail.dig_status_type) {
                if (sts.id == gsts.status_id) {
                  gsts.status = sts;
                  break;
                }
              }
            }
            this.calculateStatusInfo(group);
            parse_param_value_childs(group, detail.dig_param_type);
          }
        }

        this.scheme2 = detail;
        this.scheme2.name = scheme_name;

        //localStorage.setItem(this.scheme_s, JSON.stringify(detail));
        //this.log('fetched scheme detail');

        // console.log(this.scheme);

        return of(true);
      }),
      catchError(this.handleError('checkCurrentScheme', false))
    );
  }

  public calculateStatusInfo(group: Device_Item_Group): void {
    const strings: string[] = [];
    let str;
    let color = 'green';
    let short_text = 'Ok';
    let last_error_level = 0;

    if (group.statuses === undefined) {
      group.statuses = [];
    }

    for (const sts of group.statuses) {
      if (sts.status.category_id > last_error_level) {
        last_error_level = sts.status.category_id;
        color = sts.status.category.color;
        short_text = sts.status.category.name;
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

  public devItemById(item_id: number): Device_Item {
    for (const dev of this.scheme.device) {
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
    return url + '/?scheme_id=' + this.scheme.id.toString();
  }

  getMembers(): Observable<PaginatorApi<Scheme_Group_Member>> {
    return this.getPiped<PaginatorApi<Scheme_Group_Member>>(this.url('scheme_group'), 'fetched scheme group list', 'getMembers');
  }

  upload_file(item_id: number, file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('fileKey', file, file.name);

    const options = { headers: new HttpHeaders() };
    options.headers.append('Content-Type', 'multipart/form-data');

    const url = this.apiUrl + `write_item_file/?scheme_id=${this.scheme.id}&item_id=${item_id}`;
    return this.http.put(url, formData, options)
            .catch(error => Observable.throw(error));
  }

  getLogs(date_from: number, date_to: number, group_type: number, itemtypes: string, items: string, limit: number = 1000, offset: number = 0): Observable<PaginatorApi<Log_Data>> {
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
    return this.getPiped<PaginatorApi<Log_Data>>(url, `fetched logs list`, 'getLogs');
  }

  exportExcel(conf: ExportConfig, path?: string): Observable<HttpResponse<Blob>> {
    if (!path) {
      path = 'excel';
    }

    const url = `/export/${path}/?scheme_id=${this.scheme.id}`;
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
