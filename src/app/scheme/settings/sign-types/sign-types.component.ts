import {Component, OnInit} from '@angular/core';

import {SchemeService} from '../../scheme.service';
import {Sign_Type} from '../../scheme';

import {ChangeTemplate, Structure_Type} from '../settings';

@Component({
  selector: 'app-sign-types',
  templateUrl: './sign-types.component.html',
  styleUrls: ['../settings.css', './sign-types.component.css']
})
export class SignTypesComponent extends ChangeTemplate<Sign_Type> implements OnInit {
  constructor(
    schemeService: SchemeService,
  ) {
    super(schemeService, Sign_Type, Structure_Type.ST_SIGN_TYPE);
  }

  getObjects(): Sign_Type[] {
    return this.schemeService.scheme.sign_type;
  }

  ngOnInit() {
    this.fillItems();
  }
}
