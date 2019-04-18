import { Component, OnInit } from '@angular/core';

import { HouseService } from "../house.service";
import { Section, ViewItem } from "../house";

@Component({
  selector: 'app-view-item',
  templateUrl: './view-item.component.html',
  styleUrls: ['./view-item.component.css']
})
export class ViewItemComponent implements OnInit {
  houseName: string;
  sections: Section[];

  constructor(
    private houseService: HouseService
  ) { }

  ngOnInit() {
    this.get_view_item();
  }

  get_view_item(): void
  {
    this.houseName = this.houseService.house.name;
    this.sections = this.houseService.house.sections;
  }
}
