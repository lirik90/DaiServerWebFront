import { Component, OnInit, ViewChild } from '@angular/core';
import {Router, ActivatedRoute, RouterOutlet } from '@angular/router';

import { HouseService } from '../house.service';
import { View } from '../house';
import {MatPaginator} from '@angular/material';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['../../sections.css', './view.component.css']
})
export class ViewComponent implements OnInit {
  @ViewChild(RouterOutlet, {static: false}) outlet: RouterOutlet;
  views: View[];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private houseService: HouseService
  ) { }

  ngOnInit() {
    this.get_views();
  }

  get_views(): void {
    this.views = this.houseService.house.views;

    if (!this.outlet.isActivated) {
      Promise.resolve(null).then(() => this.router.navigate([this.views[0].id], {relativeTo: this.route}));
    }
  }

  onDeactivate($event: any) {
    Promise.resolve(null).then(() => this.router.navigate([this.views[0].id], {relativeTo: this.route}));
  }
}
