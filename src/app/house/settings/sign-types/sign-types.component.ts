import { Component, OnInit } from '@angular/core';

import { HouseService } from "../../house.service";
import { SignType } from "../../house";

@Component({
  selector: 'app-sign-types',
  templateUrl: './sign-types.component.html',
  styleUrls: ['../../../houses/list/list.component.css', './sign-types.component.css']
})
export class SignTypesComponent implements OnInit {
  signTypes: SignType[];
  sign: SignType;

  constructor(
    private houseService: HouseService,
  ) {}

  ngOnInit() {
    this.signTypes = this.houseService.house.signTypes;
  }

  select(sign: SignType): void {
    this.sign = this.sign == sign ? undefined : sign;
  }
  
  remove(sign: SignType): void {
    // Dialog
  }

  add(): void {
    this.sign = new SignType();
    this.sign.id = 0;
    this.signTypes.push(this.sign);
  }

  save(): void {
    this.sign.name = this.sign.name.trim();
    if (!this.sign.name) return;
  }

}
