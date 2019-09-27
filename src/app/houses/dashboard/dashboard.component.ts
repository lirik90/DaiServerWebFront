import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

import { House } from '../../user';
import { HousesService } from '../houses.service';
import {FavService} from '../../fav.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css', '../../sections.css']
})
export class DashboardComponent implements OnInit {

  houses: House[] = [];
  favhouses: any[];

  constructor(
	  private router: Router,
	  private housesService: HousesService,
    private favService: FavService) { }

  ngOnInit() {
    this.getHouses();

    this.getFavHouses();
  }

  getHouses(): void {
    this.housesService.getHouses(5, 0, '-lastUsage')
      .subscribe(data => this.houses = data.results.slice(0, 5));
  }

  getFavHouses(): void {
    this.favhouses = this.favService.getFavs();

    console.log(this.favhouses);1
  }
}
