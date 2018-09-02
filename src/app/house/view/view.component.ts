import { Component, OnInit } from '@angular/core';

import { HouseService } from "../house.service";
import { Section } from "../house";

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['../../sections.css', './view.component.css']
})
export class ViewComponent implements OnInit {
  houseId: number;
  sections: Section[];

  constructor(
    private houseService: HouseService
  ) {}

  ngOnInit() {
    this.getSections();
  }

  getSections(): void {
    this.houseId = this.houseService.house.id;
    this.sections = this.houseService.house.sections;
  }
}
