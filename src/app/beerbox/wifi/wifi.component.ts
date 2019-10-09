import { Component, OnInit } from '@angular/core';
import {HouseService} from '../../house/house.service';
import {DeviceItem} from '../../house/house';
import {ControlService} from '../../house/control.service';
import {AuthenticationService} from '../../authentication.service';

@Component({
  selector: 'app-wifi',
  templateUrl: './wifi.component.html',
  styleUrls: ['./wifi.component.css']
})
export class WifiComponent implements OnInit {
  wifi_pwd: DeviceItem;
  wifi_ssid: DeviceItem;
  hasAccess: boolean;

  constructor(
    private houseService: HouseService,
    private controlService: ControlService,
    private authService: AuthenticationService,
  ) { }

  ngOnInit() {
    this.hasAccess = this.authService.isFullAccess() || this.authService.isAdmin();

    const network = this.houseService.house.sections[0].groups.find(g => g.type.name === 'network').items;

    this.wifi_pwd = network.find(i => i.type.name === 'wifi_pwd');
    this.wifi_ssid = network.find(i => i.type.name === 'wifi_ssid');
  }

  save(ssid: HTMLInputElement, pwd: HTMLInputElement) {
    console.log(ssid.value);
    console.log(pwd.value);
    this.controlService.writeToDevItem(this.wifi_ssid.id, ssid.value);
    this.controlService.writeToDevItem(this.wifi_pwd.id, pwd.value);
  }
}
