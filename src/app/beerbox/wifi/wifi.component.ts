import { Component, OnInit } from '@angular/core';
import {HouseService} from '../../house/house.service';

@Component({
  selector: 'app-wifi',
  templateUrl: './wifi.component.html',
  styleUrls: ['./wifi.component.css']
})
export class WifiComponent implements OnInit {
  wifi: any;

  constructor(
    private houseService: HouseService,
  ) { }

  ngOnInit() {

    this.wifi = this.houseService.house.sections[0].groups.find(g => g.type.name === 'network');

  }

}
