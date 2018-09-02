import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from "@angular/router";
import { MatPaginator } from '@angular/material';
import { startWith } from 'rxjs/operators/startWith';

import { House } from '../../user';
import { HousesService } from '../houses.service';

@Component({
  selector: 'app-houses',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class HouseListComponent implements OnInit {

  houses: House[];
  new_house: House = {} as House;

  resultsLength = 0;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
	  private router: Router,
	  private housesService: HousesService) { }

  ngOnInit() {
    this.getHouses();
  }

  getHouses(): void {
    this.paginator.page.pipe(
      startWith({}),
    ).subscribe(data => {
      const limit: number = this.paginator.pageSize;
      const start: number = this.paginator.pageIndex;

      this.housesService.getHouses(limit !== undefined ? limit : 10, start !== undefined ? start : 0, 'title')
        .subscribe(data => { 
          this.resultsLength = data.count;
          this.houses = data.results;
        });
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
}
