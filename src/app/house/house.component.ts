import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { MediaMatcher } from '@angular/cdk/layout';
import { ISubscription } from "rxjs/Subscription";

import { HouseService } from "./house.service";
import { ControlService, Cmd } from "./control.service";
import { AuthenticationService } from "../authentication.service";

interface NavLink {
  link: string;
  text: string;
  icon: string;
}

@Component({
  selector: 'app-house',
  templateUrl: './house.component.html',
  styleUrls: ['./house.component.css']
})
export class HouseComponent implements OnInit, OnDestroy {
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  fillerNav: NavLink[] = [{link: 'detail', text: 'Сведения', icon: 'perm_device_information'}];

  status_checked: boolean = false;
  connection_str: string = ' '; // HouseComponent.getConnectionString(false);
  connected: boolean = false;

  dt_offset: number = 0;
  dt_tz_name: string = '';
  dt_interval: any;
  dt_text: string = '';

  can_see_more: boolean;
  can_edit: boolean;

  private bytes_sub: ISubscription;
  private opened_sub: ISubscription;

  private static getConnectionString(connected: boolean): string {
    return connected ? undefined : "Нет соединения с сервером";
  }
  
	get status_class(): string {
	  if (this.connection_str !== undefined && this.connection_str != ' ')
		  return "status_fail";
	  if (this.status_checked)
			return this.connected ? "status_ok" : "status_bad";
		return "status_check";
	}

  get status_desc(): string {
	  if (this.connection_str !== undefined && this.connection_str != ' ')
		  return this.connection_str;
	  if (this.status_checked)
			return this.connected ? "На связи" : "Не на связи";
		return "Подождите...";
  }

  constructor(
    public houseService: HouseService,
    private route: ActivatedRoute,
    private controlService: ControlService,
    private authService: AuthenticationService,
    changeDetectorRef: ChangeDetectorRef, media: MediaMatcher
  ) { 
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
	}

  ngOnInit() {
    this.can_see_more = this.authService.canChangeHouse();
    this.can_edit = this.authService.canChangeItemState();

    if (this.can_see_more) {
      this.fillerNav.push({link: 'view', text: 'Обзор', icon: 'home'});
      this.fillerNav.push({link: 'manage', text: 'Управление', icon: 'build'});
      this.fillerNav.push({link: 'log', text: 'Журнал', icon: 'event_note'});
      this.fillerNav.push({link: 'settings', text: 'Структура', icon: 'settings'});
    }
    this.fillerNav.push({link: 'reports', text: 'Отчёты', icon: 'show_chart'});

    // For Beerbox
    if (this.can_see_more)
      this.fillerNav.push({link: 'beerbox/wash', text: 'Промывка', icon: 'opacity'});
    if (this.can_edit)
      this.fillerNav.push({link: 'beerbox/replace_keg', text: 'Замена кег', icon: 'repeat'});
	  if (this.can_edit)
      this.fillerNav.push({link: 'beerbox/calibration', text: 'Калибровка', icon: 'compass_calibration'});
	  if (this.can_edit)
      this.fillerNav.push({link: 'beerbox/check-head-stand', text: 'Стенд', icon: 'settings_input_component'});
	  if (this.can_edit)
      this.fillerNav.push({link: 'beerbox/replace_labels', text: 'Замена ленты', icon: 'layers'});

    this.getHouseInfo();
  }

  ngOnDestroy() {
    this.mobileQuery.removeListener(this._mobileQueryListener);

    this.opened_sub.unsubscribe();
    this.bytes_sub.unsubscribe();
    this.controlService.close();
    this.houseService.clear();
  }

  clearTime(): void {
    if (this.dt_interval) {
      clearInterval(this.dt_interval);
      this.dt_text = '';
    }
  }

  getHouseInfo(): void {
    this.bytes_sub = this.controlService.byte_msg.subscribe(msg => {
      if (msg.cmd == Cmd.ConnectInfo) {

        if (msg.data === undefined) {
          console.log('ConnectInfo without data');
          return;
        }
        const info = this.controlService.parseConnectInfo(msg.data);

        this.connected = info.connected;

        if (this.connected && info.time && info.time_zone) {
          this.dt_offset = new Date().getTime() - info.time;
          this.dt_tz_name = info.time_zone.replace(', стандартное время', '');
          if (!this.dt_interval) {
            let gen_time_string = () => {
              let dt = new Date();
              dt.setTime(dt.getTime() - this.dt_offset);

              const months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
              let t_num = (num: number): string => {
                return (num < 10 ? '0' : '') + num.toString();
              };

              this.dt_text = t_num(dt.getHours()) + ':' + t_num(dt.getMinutes()) + ':' + t_num(dt.getSeconds()) + ', ' +
                t_num(dt.getDate()) + ' ' + months[dt.getMonth()] + ' ' + dt.getFullYear();
                
            };
            gen_time_string();
            this.dt_interval = setInterval(gen_time_string, 1000);
          }
        }

        if (!this.status_checked)
          this.status_checked = true;
      }
    });

    this.opened_sub = this.controlService.opened.subscribe(opened => {
      this.connection_str = HouseComponent.getConnectionString(opened);

      if (opened)
        this.controlService.getConnectInfo();
      else {
        this.clearTime();
        this.connected = false;
      }
    });

    this.controlService.open();
  }
}
