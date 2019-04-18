import { Component, OnInit } from '@angular/core';

import { HouseService } from "../house.service";
import { View } from "../house";

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['../../sections.css', './view.component.css']
})
export class ViewComponent implements OnInit {
  views: View[];

  constructor(
    private houseService: HouseService
  ) {}

  ngOnInit() {
    this.get_views();
  }

  get_views(): void {
    this.views = this.houseService.house.views;
  }
}
