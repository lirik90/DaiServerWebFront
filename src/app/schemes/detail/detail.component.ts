import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { Scheme } from '../../user';
import { SchemesService } from '../schemes.service';
import { AuthenticationService } from "../../authentication.service";

@Component({
  selector: 'app-scheme-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class SchemeDetailComponent implements OnInit {
  scheme: Scheme;
  can_save: boolean;
  cities: any[];
  comps: any[];

  constructor(
    private route: ActivatedRoute,
    private schemesService: SchemesService,
    private authService: AuthenticationService,
    private location: Location
  ) { }

  ngOnInit() {
    this.can_save = true;
    this.getScheme();

    this.schemesService.getCities().subscribe(data => {
      this.cities = data.results;
    });

    this.schemesService.getCompanies().subscribe(data => {
      this.comps = data.results;
    });
  }

  private getSchemeName(): string {
    const p_str: string = 'name';
    if (this.route.snapshot.paramMap.has(p_str))
      return this.route.snapshot.paramMap.get(p_str);
    return this.route.parent.snapshot.paramMap.get(p_str);
  }

  getScheme(): void {
    const name = this.getSchemeName();
    this.schemesService.getScheme(name)
      .subscribe(scheme => {
        this.scheme = scheme;
      });
  }

  save(): void {
    if (this.scheme.city == 0) {
      this.scheme.city = null;
    }

    if (this.scheme.company == 0) {
      this.scheme.company = null;
    }

    this.schemesService.updateScheme(this.scheme)
     .subscribe(() => {});
  }


  goBack(): void {
    this.location.back();
  }
}
