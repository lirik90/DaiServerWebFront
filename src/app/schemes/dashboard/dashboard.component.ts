import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

import { Scheme } from '../../user';
import { SchemesService } from '../schemes.service';
import {FavService} from '../../fav.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css', '../../sections.css']
})
export class DashboardComponent implements OnInit {

  schemes: Scheme[] = [];
  favschemes: any[];

  constructor(
	  private router: Router,
	  private schemesService: SchemesService,
    private favService: FavService) { }

  ngOnInit() {
    this.getSchemes();

    this.getFavSchemes();
  }

  getSchemes(): void {
    this.schemesService.getSchemes(5, 0, '-last_usage')
      .subscribe(data => this.schemes = data.results.slice(0, 5));
  }

  getFavSchemes(): void {
    this.favschemes = this.favService.getFavs();

    console.log(this.favschemes);1
  }
}
