import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

import { House } from '../../user';
import { HousesService } from '../houses.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css', '../../sections.css']
})
export class DashboardComponent implements OnInit {

  houses: House[] = [];

  constructor(
	  private router: Router,
	  private housesService: HousesService) { }

  ngOnInit() {
    this.getHouses();
  }

  getHouses(): void {
    this.housesService.getHouses(5, 0, '-lastUsage')
      .subscribe(data => this.houses = data.results.slice(0, 5));
  }
}
