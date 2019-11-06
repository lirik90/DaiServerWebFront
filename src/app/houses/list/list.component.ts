import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material';

import {House, PaginatorApi} from '../../user';
import { HousesService } from '../houses.service';
import {PageEvent} from '@angular/material/typings/paginator';
import {HttpClient} from '@angular/common/http';
import {Connection_State, ControlService} from '../../house/control.service';
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
  selector: 'app-houses',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class HouseListComponent implements OnInit, OnDestroy {
  timeout: number;

  constructor(private router: Router,
              private housesService: HousesService,
              protected http: HttpClient,
              public translate: TranslateService,
  ) {}

  httpReqs: Subject<void> = new Subject<void>();
  searchString: Subject<string> = new Subject<string>();

  statusItemSubs: Subscription[] = [];
  housesSubs: Subscription;

  searchQ: Subject<string>;

  houses: House[] = [];
  new_house: House = {} as House;

  resultsLength = 0;

  statusInfo = {};
  statusQueue = {};

  @ViewChild(MatPaginator) paginator: MatPaginator;
  citySelected = null;
  cities: any[];
  compSelected: any;
  comps: any[];
  pageEvent: void;

  @ViewChild('searchBox') searchBox;

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
    this.getHouses();

    this.housesService.getCities().subscribe(data => {
      this.cities = data.results;
    });

    this.housesService.getCompanies().subscribe(data => {
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

    this.getHouses(v);
  }

  getHouses(query: string = ''): void {
    this.ngOnDestroy();

    if (this.housesSubs) {
      this.housesSubs.unsubscribe();
    }

    if (this.statusItemSubs) {
      this.statusItemSubs.map(ss => ss.unsubscribe());
    }

    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    const limit = this.paginator.pageSize;
    const start = this.paginator.pageIndex;

    this.housesSubs = this.housesService.getHouses(limit !== undefined ? limit : 10, start !== undefined ? start : 0, 'title',
      query)
      .subscribe(dat => {
        console.log(dat);
        this.resultsLength = dat.count;
        this.houses = dat.results;

        //console.log(this.houses);
        this.timeout = setTimeout(this.getStatuses, 1000, this);

        this.housesSubs.unsubscribe();
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
    this.new_house.name = this.new_house.name.trim();
    this.new_house.title = this.new_house.title.trim();
    this.new_house.description = this.new_house.description.trim();
    this.new_house.device = this.new_house.device.trim();
    if (!this.new_house.name || !this.new_house.title || !this.new_house.device) { return; }
    this.housesService.addHouse(this.new_house)
      .subscribe(house => {
        this.new_house = {} as House;
        this.houses.push(house);
      });
  }

  delete(house: House): void {
    this.houses = this.houses.filter(h => h !== house);
    this.housesService.deleteHouse(house).subscribe();
  }

  detail(house: House): void {
    this.router.navigate([`/detail/${house.id}/`]);
  }

  getPaginatorData(event: PageEvent) {
    console.log(event);

    const q = this.searchBox.nativeElement.value;

    console.log(q);
    this.search(q);
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
      case Connection_State.CS_CONNECTED:
        return 'status_ok';
      case Connection_State.CS_CONNECTED_MODIFIED:
        return 'status_modified';
      case Connection_State.CS_DISCONNECTED_JUST_NOW:
        return 'status_bad_just';
      case Connection_State.CS_CONNECTED_JUST_NOW:
        return 'status_sync';
      case Connection_State.CS_CONNECTED_SYNC_TIMEOUT:
        return 'status_sync_fail';
    }
  }

  private getStatusInfo(id: number) {
    const statusInfoSubs = this.http.get<any[]>(`/api/v2/project/${id}/status_info`).subscribe(statusInfo => {
      this.statusInfo[id] = statusInfo;

      /*
      console.log(`${id} is loaded`);
      console.log(statusInfo);
       */

      if (this.statusQueue[id]) {
        // parse a queue

        this.statusQueue[id].depHouses.map(dh => {
          this.putMessages(dh.id, dh.si, statusInfo);
        });
      }

      statusInfoSubs.unsubscribe();
    });
  }

  private putMessages(id: number, statusItems: StatusItems, st: StatusInfo[]) {
    const house = this.houses.find(h => h.id === id);

    for (let i = 0; i < statusItems.items.length; i++) {
      const si = statusItems.items[i];

      const st_item = st.find(sti => sti.id === si.status_id);
      house.messages.push({status: st_item.type_id, text: st_item.text, where: si.title});
    }
  }

  private getStatuses(th: HouseListComponent) {
    console.log(th.houses);
    th.houses.map(h => {
      const id = h.parent || h.id;

      h.mod_state = false;
      h.loses_state = false;
      h.status_checked = false;
      h.connect_state = Connection_State.CS_SERVER_DOWN;

      // get status
      const sub = th.httpGet<StatusItems>(`/api/v2/project/${h.id}/status_item`).subscribe(statusItems => {
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
            th.statusQueue[id] = {isLoading: false, depHouses: []}; // create a place in queue
          }
          th.statusQueue[id].depHouses.push({id: h.id, si: statusItems}); // put house as a depeneded

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
