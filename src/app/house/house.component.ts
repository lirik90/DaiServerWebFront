import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { MediaMatcher } from '@angular/cdk/layout';
import { MatDialog, MatDialogRef } from '@angular/material';

import { ISubscription } from "rxjs/Subscription";

import { HouseService } from "./house.service";
import { ControlService, Cmd } from "./control.service";
import { AuthenticationService } from "../authentication.service";
import {TranslateService} from '@ngx-translate/core';

interface NavLink {
  link: string;
  text: string;
  icon: string;
}

enum Connect_State {
  Disconnected,
  Connected,
  Modified
}

@Component({
  selector: 'app-house',
  templateUrl: './house.component.html',
  styleUrls: ['./house.component.css']
})
export class HouseComponent implements OnInit, OnDestroy {
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  fillerNav: NavLink[] = [];

  status_checked: boolean = false;
  connection_str: string = ' '; // HouseComponent.getConnectionString(false);

  connect_state: Connect_State = Connect_State.Disconnected;
  get connected(): boolean
  {
    return this.connect_state != Connect_State.Disconnected;
  }

  private page_reload_dialog_ref: MatDialogRef<PageReloadDialogComponent> = undefined;

  dt_offset: number = 0;
  dt_tz_name: string = '';
  dt_interval: any;
  dt_text: string = '';

  can_see_more: boolean;
  can_edit: boolean;

  private bytes_sub: ISubscription;
  private opened_sub: ISubscription;

  private getConnectionString(connected: boolean): string {
    return connected ? undefined : this.translate.instant("CONNECTION_PROBLEM");
  }
  
	get status_class(): string {
	  if (this.connection_str !== undefined && this.connection_str != ' ')
		  return "status_fail";
	  if (this.status_checked)
    {
      switch(this.connect_state) {
        case Connect_State.Disconnected: return 'status_bad';
        case Connect_State.Connected: return 'status_ok';
        case Connect_State.Modified: return 'status_modified';
      }
    }
		return "status_check";
	}

  get status_desc(): string {
	  if (this.connection_str !== undefined && this.connection_str != ' ')
		  return this.connection_str;
	  if (this.status_checked)
    {
      switch (this.connect_state) {
        case Connect_State.Disconnected: return this.translate.instant("OFFLINE");
        case Connect_State.Connected: return this.translate.instant("ONLINE");
        case Connect_State.Modified: return this.translate.instant("MODIFIED");
      }
    }
		return this.translate.instant("WAIT") + '...';
  }

  constructor(
	  public translate: TranslateService,
    public houseService: HouseService,
    private route: ActivatedRoute,
    private controlService: ControlService,
    private authService: AuthenticationService,
    private dialog: MatDialog,
    changeDetectorRef: ChangeDetectorRef, media: MediaMatcher
  ) { 
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
	}

  ngOnInit() {
    this.can_see_more = this.authService.canChangeHouse();
    this.can_edit = this.authService.canChangeItemState();

    this.fillerNav.push({link: 'detail', text: this.translate.instant("NAVIGATION_TAB.INFO"), icon: 'perm_device_information'});
    
    if (this.can_see_more) {
      this.fillerNav.push({link: 'view', text: this.translate.instant("NAVIGATION_TAB.OVERVIEW"), icon: 'home'});
      this.fillerNav.push({link: 'manage', text: this.translate.instant("NAVIGATION_TAB.MANAGEMENT"), icon: 'build'});
      this.fillerNav.push({link: 'log', text: this.translate.instant("NAVIGATION_TAB.LOG"), icon: 'event_note'});
      this.fillerNav.push({link: 'settings', text: this.translate.instant("NAVIGATION_TAB.STRUCTURE"), icon: 'settings'});
    }
    this.fillerNav.push({link: 'reports', text: this.translate.instant("NAVIGATION_TAB.REPORTS"), icon: 'show_chart'});

    // For Beerbox
    if (this.can_see_more)
      this.fillerNav.push({link: 'beerbox/wash', text: this.translate.instant("NAVIGATION_TAB.WASH"), icon: 'opacity'});
    if (this.can_edit)
      this.fillerNav.push({link: 'beerbox/replace_keg', text: this.translate.instant("NAVIGATION_TAB.REPLACE_KEG"), icon: 'repeat'});
	  if (this.can_edit)
      this.fillerNav.push({link: 'beerbox/calibration', text: this.translate.instant("NAVIGATION_TAB.CALIBRATION"), icon: 'compass_calibration'});
	  if (this.can_edit)
      this.fillerNav.push({link: 'beerbox/check-head-stand', text: this.translate.instant("NAVIGATION_TAB.STAND"), icon: 'category'});
	  if (this.can_edit)
      this.fillerNav.push({link: 'beerbox/replace_labels', text: this.translate.instant("NAVIGATION_TAB.REPLACE_LABEL"), icon: 'layers'});
	  if (this.can_edit)
      this.fillerNav.push({link: 'beerbox/update_beer_info', text: this.translate.instant("NAVIGATION_TAB.BEER_INFO"), icon: 'receipt'});
    if (this.can_edit)
      this.fillerNav.push({link: 'beerbox/change_controller_address', text: this.translate.instant("NAVIGATION_TAB.CONTROLLER"), icon: 'settings_input_component'});

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

        if (info.connected)
          this.connect_state = info.modified ? Connect_State.Modified : Connect_State.Connected;
        else
          this.connect_state = Connect_State.Disconnected;

        if (info.connected && info.time && info.time_zone) {
          this.dt_offset = new Date().getTime() - info.time;
          this.dt_tz_name = info.time_zone.replace(', стандартное время', '');
          if (!this.dt_interval) {
            let gen_time_string = () => {
              let dt = new Date();
              dt.setTime(dt.getTime() - this.dt_offset);

              const months = this.translate.instant("MONTHS");
              let t_num = (num: number): string => {
                return (num < 10 ? '0' : '') + num.toString();
              };

              this.dt_text = t_num(dt.getHours()) + ':' + t_num(dt.getMinutes()) + ':' + t_num(dt.getSeconds()) + ', ' +
                t_num(dt.getDate()) + ' ' + (months.length == 12 ? months[dt.getMonth()] : dt.getMonth()) + ' ' + dt.getFullYear();
                
            };
            gen_time_string();
            this.dt_interval = setInterval(gen_time_string, 1000);
          }
        }

        if (!this.status_checked)
          this.status_checked = true;
      }
      else if (msg.cmd == Cmd.StructModify)
      {
        let view = new Uint8Array(msg.data);
        const structure_type = view[8];
        switch (structure_type)
        {
          case 19: // STRUCT_TYPE_GROUP_STATUS
            return;
        }

        this.connect_state = Connect_State.Modified;

        if (!this.page_reload_dialog_ref)
        {
          this.page_reload_dialog_ref = this.dialog.open(PageReloadDialogComponent, { width: '80%', });
          this.page_reload_dialog_ref.afterClosed().subscribe(result => {
            if (result)
              window.location.reload();
            this.page_reload_dialog_ref = undefined;
          });
        }
      }
    });

    this.opened_sub = this.controlService.opened.subscribe(opened => {
      this.connection_str = this.getConnectionString(opened);

      if (opened)
        this.controlService.getConnectInfo();
      else {
        this.clearTime();
        this.connect_state = Connect_State.Disconnected;
      }
    });

    this.controlService.open();
  }

  restart(): void {
    if (this.can_edit)
      this.controlService.restart();
  }
}

@Component({
  templateUrl: './page-reload-dialog.component.html',
})
export class PageReloadDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<PageReloadDialogComponent>
  ) {}
}
