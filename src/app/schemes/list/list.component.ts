import {Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material';

import {Scheme, PaginatorApi} from '../../user';
import { SchemesService } from '../schemes.service';
import {AuthenticationService} from '../../authentication.service';
import {PageEvent} from '@angular/material/typings/paginator';
import {HttpClient} from '@angular/common/http';
import {Connection_State, ControlService} from '../../scheme/control.service';
import {TranslateService} from '@ngx-translate/core';
import {Observable, of, Subject, Subscription} from 'rxjs';
import {SubCommandDescription} from '@angular/cli/models/interface';
import {debounceTime, distinctUntilChanged, switchMap, takeUntil} from 'rxjs/operators';

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

class StatusInfo {
  groupType_id: number;
  id: number;
  inform: boolean;
  name: string;
  text: string;
  type_id: number;
}

@Component({
  selector: 'app-schemes',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class SchemeListComponent implements OnInit, OnDestroy {
  timeout: any;
  is_admin: boolean;
  start = 0;
  limit = 10;

  constructor(private router: Router,
              private schemesService: SchemesService,
              private authService: AuthenticationService,
              protected http: HttpClient,
              public translate: TranslateService,
  ) {}

  httpReqs: Subject<void> = new Subject<void>();
  searchString: Subject<string> = new Subject<string>();

  statusItemSubs: Subscription[] = [];
  schemesSubs: Subscription;

  searchQ: Subject<string>;

  schemes: Scheme[] = [];
  new_scheme: Scheme = {} as Scheme;

  resultsLength = 0;

  statusInfo = {};
  statusQueue = {};

  @ViewChildren(MatPaginator) paginator: QueryList<MatPaginator>;
  citySelected = null;
  cities: any[];
  compSelected: any;
  comps: any[];
  pageEvent: PageEvent;

  @ViewChild('searchBox', {static: true}) searchBox;

  httpGet<T>(req: string): Observable<T> {
    return this.http.get<T>(req)
      .pipe( takeUntil(this.httpReqs) );
  }

  ngOnDestroy(): void {
    // This aborts all HTTP requests.
    this.httpReqs.next();
    // This completes the subject properlly.
    this.httpReqs.complete();
  }

  ngOnInit() {
    this.is_admin = this.authService.isAdmin();

    this.getSchemes();

    this.schemesService.getCities().subscribe(data => {
      this.cities = data.results;
    });

    this.schemesService.getCompanies().subscribe(data => {
      this.comps = data.results;
    });

    this.searchString.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(text => {
        this.search(text);
        return of(text);
      })
    ).subscribe(response => {

    });
  }

  search(value: string) {
    let v = value;

    if (this.citySelected) {
      v += '&city__id=' + this.citySelected;
    }

    if (this.compSelected) {
      v += '&company__id=' + this.compSelected;
    }

    this.getSchemes(v);
  }

  getSchemes(query: string = ''): void {
    this.ngOnDestroy();

    if (this.schemesSubs) {
      this.schemesSubs.unsubscribe();
    }

    if (this.statusItemSubs) {
      this.statusItemSubs.map(ss => ss.unsubscribe());
    }

    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    if (this.paginator) {
      console.log(this.paginator);
    }

    this.schemesSubs = this.schemesService.getSchemes(this.limit, this.start, 'title',
      query)
      .subscribe(dat => {
        console.log(dat);
        this.resultsLength = dat.count;
        this.schemes = dat.results;

        //console.log(this.schemes);
        this.timeout = setTimeout(this.getStatuses, 1000, this);

        this.schemesSubs.unsubscribe();
      });
  }

  parseConnectNumber(n: number) {
    // tslint:disable:no-bitwise
    const connState = n & ~Connection_State.CS_CONNECTED_MODIFIED & ~Connection_State.CS_CONNECTED_WITH_LOSSES;
    const modState = (n & Connection_State.CS_CONNECTED_MODIFIED) === Connection_State.CS_CONNECTED_MODIFIED;
    const losesState = (n & Connection_State.CS_CONNECTED_WITH_LOSSES) === Connection_State.CS_CONNECTED_WITH_LOSSES;
    // tslint:enable:no-bitwise

    return [connState, modState, losesState];
  }

  add(): void {
    this.new_scheme.name = this.new_scheme.name.trim();
    this.new_scheme.title = this.new_scheme.title.trim();
    this.new_scheme.description = this.new_scheme.description.trim();
    this.new_scheme.device = this.new_scheme.device.trim();
    if (!this.new_scheme.name || !this.new_scheme.title || !this.new_scheme.device) { return; }
    this.schemesService.addScheme(this.new_scheme)
      .subscribe(scheme => {
        this.new_scheme = {} as Scheme;
        this.schemes.push(scheme);
      });
  }

  delete(scheme: Scheme): void {
    this.schemes = this.schemes.filter(h => h !== scheme);
    this.schemesService.deleteScheme(scheme).subscribe();
  }

  detail(scheme: Scheme): void {
    this.router.navigate([`/detail/${scheme.id}/`]);
  }

  getPaginatorData(event: PageEvent) {
    console.log(event);

    const q = this.searchBox.nativeElement.value;

    this.limit = event.pageSize;
    this.start = event.pageIndex;

    console.log(q);
    this.search(q);

    return event;
  }

  status_desc(h): string {
    if (h.connection_str !== undefined && h.connection_str !== ' ') {
      return h.connection_str;
    }

    let result = '';

    if (h.mod_state) {
      result += this.translate.instant('MODIFIED') + '. ';
    }


    if (h.loses_state) {
      result += 'С потерями пакетов. ';
    }

    if (h.status_checked) {
      switch (h.connect_state) {
        case Connection_State.CS_SERVER_DOWN:
          return this.translate.instant('SERVER_DOWN');
        case Connection_State.CS_DISCONNECTED:
          return result + this.translate.instant('OFFLINE');
        case Connection_State.CS_CONNECTED:
          return result + this.translate.instant('ONLINE');
        case Connection_State.CS_CONNECTED_MODIFIED:
          return result + this.translate.instant('MODIFIED');
        case Connection_State.CS_DISCONNECTED_JUST_NOW:
          return result + this.translate.instant('DISCONNECTED_JUST_NOW');
        case Connection_State.CS_CONNECTED_JUST_NOW:
          return result + this.translate.instant('CONNECTED_JUST_NOW');
        case Connection_State.CS_CONNECTED_SYNC_TIMEOUT:
          return result + this.translate.instant('CONNECTED_SYNC_TIMEOUT');
      }
    }
    return this.translate.instant('WAIT') + '...';
  }

  status_class(h): string {
    if (h.connection_str !== undefined && h.connection_str !== ' ') {
      return 'status_fail';
    }

    if (!h.status_checked) {
      return 'status_check';
    }

    if (h.mod_state) {
      return 'status_modified';
    }

    switch (h.connect_state) {
      case Connection_State.CS_SERVER_DOWN:
        return 'status_server_down';
      case Connection_State.CS_DISCONNECTED:
        return 'status_bad';
      case Connection_State.CS_CONNECTED_SYNC_TIMEOUT:
      //  return 'status_sync_fail';
      case Connection_State.CS_CONNECTED:
        return 'status_ok';
      case Connection_State.CS_CONNECTED_MODIFIED:
        return 'status_modified';
      case Connection_State.CS_DISCONNECTED_JUST_NOW:
        return 'status_bad_just';
      case Connection_State.CS_CONNECTED_JUST_NOW:
        return 'status_sync';
    }
  }

  private getStatusInfo(id: number) {
    const statusInfoSubs = this.http.get<any[]>(`/api/v2/scheme/${id}/dig_status_type`).subscribe(statusInfo => {
      this.statusInfo[id] = statusInfo;

      /*
      console.log(`${id} is loaded`);
      console.log(statusInfo);
       */

      if (this.statusQueue[id]) {
        // parse a queue

        this.statusQueue[id].depSchemes.map(dh => {
          this.putMessages(dh.id, dh.si, statusInfo);
        });
      }

      statusInfoSubs.unsubscribe();
    });
  }

  private putMessages(id: number, statusItems: StatusItems, st: StatusInfo[]) {
    const scheme = this.schemes.find(h => h.id === id);

    for (let i = 0; i < statusItems.items.length; i++) {
      const si = statusItems.items[i];

      const st_item = st.find(sti => sti.id === si.status_id);
      scheme.messages.push({status: st_item.type_id, text: st_item.text, where: si.title});
    }
  }

  private getStatuses(th: SchemeListComponent) {
    console.log(th.schemes);
    th.schemes.map(h => {
      const id = h.parent || h.id;

      h.mod_state = false;
      h.loses_state = false;
      h.status_checked = false;
      h.connect_state = Connection_State.CS_SERVER_DOWN;

      // get status
      const sub = th.httpGet<StatusItems>(`/api/v2/scheme/${h.id}/dig_status`).subscribe(statusItems => {
        h.messages = []; // 0 messages, wait

        // set connection status
        h.connection = statusItems.connection;
        const [connState, modState, losesState] = th.parseConnectNumber(h.connection);
        h.mod_state = <boolean>modState;
        h.loses_state = <boolean>losesState;
        h.status_checked = true;
        h.connect_state = <Connection_State>connState;

        // set messages
        if (th.statusInfo[id]) { // if we have StatusInfo
          // do it now
          th.putMessages(h.id, statusItems, th.statusInfo[id]);
        } else { // if we haven't StatusInfo
          // put into queue
          if (!th.statusQueue[id]) {
            th.statusQueue[id] = {isLoading: false, depSchemes: []}; // create a place in queue
          }
          th.statusQueue[id].depSchemes.push({id: h.id, si: statusItems}); // put scheme as a depeneded

          if (!th.statusQueue[id].isLoading) {
            // start loading if was not started
            th.statusQueue[id].isLoading = true;
            th.getStatusInfo(id);
          }
        }

        sub.unsubscribe();
      });

      th.statusItemSubs.push(sub);

    });
  }
}
