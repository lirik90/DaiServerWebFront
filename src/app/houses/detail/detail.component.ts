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

  constructor(
    private route: ActivatedRoute,
    private housesService: HousesService,
    private authService: AuthenticationService,
    private location: Location
  ) { }

  ngOnInit() {
    this.can_save = this.authService.isSupervisor();
    this.getHouse();
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
      .subscribe(house => this.house = house);
  }

  save(): void {
    this.housesService.updateHouse(this.house)
     .subscribe(() => this.goBack());
  }

  goBack(): void {
    this.location.back();
  }
}
