import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material';

import {House, PaginatorApi} from '../../user';
import { HousesService } from '../houses.service';
import {PageEvent} from '@angular/material/typings/paginator';
import {HttpClient} from '@angular/common/http';
import {Connection_State, ControlService} from '../../house/control.service';
import {TranslateService} from '@ngx-translate/core';

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

@Component({
  selector: 'app-houses',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class HouseListComponent implements OnInit {

  constructor(private router: Router,
              private housesService: HousesService,
              protected http: HttpClient,
              public translate: TranslateService,
  ) {

  }

  houses: House[];
  new_house: House = {} as House;

  resultsLength = 0;

  statusIds = {};

  @ViewChild(MatPaginator) paginator: MatPaginator;
  citySelected = null;
  cities: any[];
  compSelected: any;
  comps: any[];
  pageEvent: void;

  @ViewChild('searchBox') searchBox;

  ngOnInit() {
    this.getHouses();

    this.housesService.getCities().subscribe(data => {
      this.cities = data.results;
    });

    this.housesService.getCompanies().subscribe(data => {
      this.comps = data.results;
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

  getHouses(query: string = ''): void {
    const limit: number = this.paginator.pageSize;
    const start: number = this.paginator.pageIndex;

    const subs = this.housesService.getHouses(limit !== undefined ? limit : 10, start !== undefined ? start : 0, 'title',
      query)
      .subscribe(dat => {
        console.log(dat);
        this.resultsLength = dat.count;
        this.houses = dat.results;

        this.houses.map(h => {
          const id = h.parent || h.id;

          h.mod_state = false;
          h.loses_state = false;
          h.status_checked = false;
          h.connect_state = Connection_State.CS_SERVER_DOWN;

          const stats = new Promise<any[]>((resolve, reject) => {
            if (this.statusIds[id]) {
              resolve(this.statusIds[id]);
            } else {
              const statusItemSubs = this.http.get<any[]>(`/api/v2/project/${id}/status_info`).subscribe(statusInfo => {
                this.statusIds[id] = statusInfo;
                resolve(this.statusIds[id]);
              });
            }
          });

          stats.then(st => {
            const statusItemSubs = this.http.get<StatusItems>(`/api/v2/project/${h.id}/status_item`).subscribe(statusItems => {
              h.messages = [];

              console.log(statusItems);

              for (let i = 0; i < statusItems.items.length; i++) {
                const si = statusItems.items[i];

                const st_item = st.find(sti => sti.id === si.status_id);
                h.messages.push({status: st_item.type_id, text: st_item.text, where: si.title});
              }

              h.connection = statusItems.connection;

              //h.connection_str = undefined;
              const [connState, modState, losesState] = this.parseConnectNumber(h.connection);
              h.mod_state = <boolean>modState;
              h.loses_state = <boolean>losesState;
              h.status_checked = true;
              h.connect_state = <Connection_State>connState;

              statusItemSubs.unsubscribe();
            });
          });

        });

        subs.unsubscribe();
      });
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
}
