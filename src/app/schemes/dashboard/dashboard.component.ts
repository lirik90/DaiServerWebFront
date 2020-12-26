import {Component, OnDestroy, OnInit} from '@angular/core';
import { Router } from "@angular/router";

import { SchemesService } from '../schemes.service';
import {FavService} from '../../fav.service';
import {TranslateService} from '@ngx-translate/core';
import {HttpClient} from '@angular/common/http';
import {SchemesList} from '../schemes-list';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css', '../../sections.css', '../schemes-list.css']
})
export class DashboardComponent extends SchemesList implements OnInit, OnDestroy {
  favschemes: any[];

  constructor(
	  private router: Router,
	  private schemesService: SchemesService,
      private favService: FavService,
      http: HttpClient,
      translate: TranslateService,
  ) {
      super(http, translate);
  }

  ngOnInit() {
    this.getSchemes();

    this.getFavSchemes();
  }

  getSchemes(): void {
    this.schemesService.getSchemes(5, 0, '-last_usage')
      .subscribe(data => {
          this.schemes = data.results.slice(0, 5);
          this.getStatuses();
      });
  }

  getFavSchemes(): void {
    this.favschemes = this.favService.getFavs();

    console.log(this.favschemes);
  }

  onClick2($event: MouseEvent, scheme_name: string) {
      if (!($event.target as HTMLDivElement).classList.contains('scheme-state-icon__num')) {
          console.log(1);
          this.router.navigate([`/scheme/${scheme_name}/elements`]);
          return false;
      }
  }
}
