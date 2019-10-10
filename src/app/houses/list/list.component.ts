import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material';

import {House, PaginatorApi} from '../../user';
import { HousesService } from '../houses.service';
import {PageEvent} from '@angular/material/typings/paginator';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-houses',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class HouseListComponent implements OnInit {

  constructor(private router: Router,
              private housesService: HousesService,
              protected http: HttpClient,
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
            const statusItemSubs = this.http.get<any[]>(`/api/v2/project/${h.id}/status_item`).subscribe(statusItems => {
              h.messages = [];

              for (let i = 0; i < statusItems.length; i++) {
                const si = statusItems[i];

                if(i + 1 === statusItems.length) {
                  // connection info
                } else {
                  // house state
                  const st_item = st.find(sti => sti.id === si.status_id);
                  h.messages.push({status: st_item.type_id, text: st_item.text});
                }
              }

              //console.log(h.messages);
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
}
