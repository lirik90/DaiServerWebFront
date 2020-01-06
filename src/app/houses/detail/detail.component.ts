import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { House } from '../../user';
import { HousesService } from '../houses.service';
import { AuthenticationService } from "../../authentication.service";

@Component({
  selector: 'app-house-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class HouseDetailComponent implements OnInit {
  house: House;
  can_save: boolean;
  cities: any[];
  comps: any[];

  constructor(
    private route: ActivatedRoute,
    private housesService: HousesService,
    private authService: AuthenticationService,
    private location: Location
  ) { }

  ngOnInit() {
    this.can_save = true;
    this.getHouse();

    this.housesService.getCities().subscribe(data => {
      this.cities = data.results;
    });

    this.housesService.getCompanies().subscribe(data => {
      this.comps = data.results;
    });
  }

  private getProjName(): string {
    const p_str: string = 'name';
    if (this.route.snapshot.paramMap.has(p_str))
      return this.route.snapshot.paramMap.get(p_str);
    return this.route.parent.snapshot.paramMap.get(p_str);
  }

  getHouse(): void {
    const name = this.getProjName();
    this.housesService.getHouse(name)
      .subscribe(house => {
        this.house = house;
      });
  }

  save(): void {
    if (this.house.city == 0) {
      this.house.city = null;
    }

    if (this.house.company == 0) {
      this.house.company = null;
    }

    this.housesService.updateHouse(this.house)
     .subscribe(() => {});
  }


  goBack(): void {
    this.location.back();
  }
}
