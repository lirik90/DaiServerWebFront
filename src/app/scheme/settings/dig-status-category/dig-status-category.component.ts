import {Component, OnInit} from '@angular/core';

import {SchemeService} from '../../scheme.service';
import {DIG_Status_Category} from '../../scheme';

import {ChangeTemplate, Structure_Type} from '../settings';

@Component({
  selector: 'app-dig-status-category',
  templateUrl: './dig-status-category.component.html',
  styleUrls: ['../settings.css', './dig-status-category.component.css']
})
export class DIG_Status_Category_Component extends ChangeTemplate<DIG_Status_Category> implements OnInit {
  constructor(
    schemeService: SchemeService,
  ) {
    super(schemeService, DIG_Status_Category, Structure_Type.ST_DIG_STATUS_CATEGORY);
  }

  getObjects(): DIG_Status_Category[] {
    return this.schemeService.scheme.dig_status_category;
  }

  ngOnInit() {
    this.fillItems();
  }
}
