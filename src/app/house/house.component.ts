import {Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {MediaMatcher} from '@angular/cdk/layout';
import {MatDialog, MatDialogRef, MatSidenav} from '@angular/material';

import {ISubscription} from 'rxjs/Subscription';

import {HouseService} from './house.service';
import {ControlService, Cmd, ConnectInfo} from './control.service';
import {AuthenticationService} from '../authentication.service';
import {TranslateService} from '@ngx-translate/core';
import {UIService} from '../ui.service';
import {Router} from '@angular/router';

interface NavLink {
  link: string;
  query?: any;
  text: string;
  icon: string;
}

enum Connect_State {
  Disconnected,
  Connected,
  Modified
}

enum Connection_State {
  CS_DISCONNECTED,
  CS_DISCONNECTED_JUST_NOW,
  CS_CONNECTED_JUST_NOW,
  CS_CONNECTED_SYNC_TIMEOUT,
  CS_CONNECTED,

  CS_CONNECTED_MODIFIED = 0x80
}

@Component({
  selector: 'app-house',
  templateUrl: './house.component.html',
  styleUrls: ['./house.component.css'],
})
export class HouseComponent implements OnInit, OnDestroy {
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  fillerNav: NavLink[] = [];

  status_checked = false;
  connection_str = ' '; // HouseComponent.getConnectionString(false);

  connect_state: Connection_State = Connection_State.CS_DISCONNECTED;
  private can_wash: boolean;

  get connected(): boolean {
    return this.connect_state !== Connection_State.CS_DISCONNECTED;
  }

  private page_reload_dialog_ref: MatDialogRef<PageReloadDialogComponent> = undefined;

  dt_offset = 0;
  dt_tz_name = '';
  dt_interval: any;
  dt_text = '';

  can_see_more: boolean;
  can_edit: boolean;

  private bytes_sub: ISubscription;
  private opened_sub: ISubscription;

  @ViewChild('snav') snav !: MatSidenav;

  private getConnectionString(connected: boolean): string {
    return connected ? undefined : this.translate.instant('CONNECTION_PROBLEM');
  }

  get status_class(): string {
    if (this.connection_str !== undefined && this.connection_str !== ' ') {
      return 'status_fail';
    }

    if (!this.status_checked) {
      return 'status_check';
    }

    switch (this.connect_state) {
      case Connection_State.CS_DISCONNECTED:
        return 'status_bad';
      case Connection_State.CS_CONNECTED:
        return 'status_ok';
      case Connection_State.CS_CONNECTED_MODIFIED:
        return 'status_modified';
    }
  }

  get status_desc(): string {
    if (this.connection_str !== undefined && this.connection_str !== ' ') {
      return this.connection_str;
    }

    if (this.status_checked) {
      switch (this.connect_state) {
        case Connection_State.CS_DISCONNECTED:
          return this.translate.instant('OFFLINE');
        case Connection_State.CS_CONNECTED:
          return this.translate.instant('ONLINE');
        case Connection_State.CS_CONNECTED_MODIFIED:
          return this.translate.instant('MODIFIED');
      }
    }
    return this.translate.instant('WAIT') + '...';
  }

  constructor(
    public translate: TranslateService,
    public houseService: HouseService,
    private route: ActivatedRoute,
    private controlService: ControlService,
    private authService: AuthenticationService,
    private dialog: MatDialog,
    public uiService: UIService,
    private router: Router,
    changeDetectorRef: ChangeDetectorRef, media: MediaMatcher
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit() {
    this.can_see_more = this.authService.canChangeHouse();
    this.can_edit = this.authService.canChangeItemState();
    this.can_wash = this.authService.canAddDeviceItem();

    this.fillerNav.push({link: 'detail', text: this.translate.instant('NAVIGATION_TAB.INFO'), icon: 'perm_device_information'});

    if (this.can_see_more) {
      this.fillerNav.push({link: 'manage', text: this.translate.instant('NAVIGATION_TAB.MANAGEMENT'), icon: 'home'});
      this.fillerNav.push({link: 'elements', text: this.translate.instant('NAVIGATION_TAB.ELEMENTS'), icon: 'build'});
      this.fillerNav.push({link: 'log', text: this.translate.instant('NAVIGATION_TAB.LOG'), icon: 'event_note'});
      this.fillerNav.push({link: 'settings', text: this.translate.instant('NAVIGATION_TAB.STRUCTURE'), icon: 'settings'});
    }
    this.fillerNav.push({link: 'reports', text: this.translate.instant('NAVIGATION_TAB.REPORTS'), icon: 'show_chart'});
    this.fillerNav.push({link: 'export', query: {data: [107]}, text: this.translate.instant('NAVIGATION_TAB.EXPORT'), icon: 'subject'});

    // For Beerbox
    if (this.can_see_more || this.can_wash) {
      this.fillerNav.push({link: 'beerbox/wash', text: this.translate.instant('NAVIGATION_TAB.WASH'), icon: 'opacity'});
    }
    if (this.can_edit) {
      this.fillerNav.push({link: 'beerbox/replace_keg', text: this.translate.instant('NAVIGATION_TAB.REPLACE_KEG'), icon: 'repeat'});
    }
    if (this.can_edit) {
      this.fillerNav.push({link: 'beerbox/kegs', text: 'Кеги', icon: 'local_drink'});
    }
    if (this.can_edit) {
      this.fillerNav.push({
        link: 'beerbox/calibration',
        text: this.translate.instant('NAVIGATION_TAB.CALIBRATION'),
        icon: 'compass_calibration'
      });
    }
    if (this.can_see_more) {
      this.fillerNav.push({link: 'beerbox/check-head-stand', text: this.translate.instant('NAVIGATION_TAB.STAND'), icon: 'category'});
    }
    if (this.can_edit) {
      this.fillerNav.push({link: 'beerbox/replace_labels', text: this.translate.instant('NAVIGATION_TAB.REPLACE_LABEL'), icon: 'layers'});
    }
    if (this.can_edit) {
      this.fillerNav.push({link: 'beerbox/update_beer_info', text: this.translate.instant('NAVIGATION_TAB.BEER_INFO'), icon: 'receipt'});
    }
    if (this.can_edit) {
      this.fillerNav.push({
        link: 'beerbox/change_controller_address',
        text: this.translate.instant('NAVIGATION_TAB.CONTROLLER'),
        icon: 'settings_input_component'
      });
    }
    if (this.can_edit) {
      this.fillerNav.push({
        link: 'beerbox/operation_hours',
        text: this.translate.instant('NAVIGATION_TAB.OPERATION_HOURS'),
        icon: 'access_time'
      });
    }

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

  getConnectionState(info:  ConnectInfo) {
    if (!info.connected) {
      return Connection_State.CS_DISCONNECTED;
    }

    if (info.modified) {
      return Connection_State.CS_CONNECTED_MODIFIED;
    }

    return Connection_State.CS_CONNECTED;
  }

  getHouseInfo(): void {
    this.bytes_sub = this.controlService.byte_msg.subscribe(msg => {

      if (msg.cmd === Cmd.ConnectInfo) {

        if (msg.data === undefined) {
          console.log('ConnectInfo without data');
          return;
        }

        const info = this.controlService.parseConnectInfo(msg.data);

        /* get connecton state */
        this.connect_state = this.getConnectionState(info);

        if (info.connected && info.time && info.time_zone) {
          this.dt_offset = new Date().getTime() - info.time;
          this.dt_tz_name = info.time_zone.replace(', стандартное время', '');
          if (!this.dt_interval) {
            const gen_time_string = () => {
              const dt = new Date();
              dt.setTime(dt.getTime() - this.dt_offset);

              const months = this.translate.instant('MONTHS');
              const t_num = (num: number): string => {
                return (num < 10 ? '0' : '') + num.toString();
              };

              this.dt_text = t_num(dt.getHours()) + ':' + t_num(dt.getMinutes()) + ':' + t_num(dt.getSeconds()) + ', ' +
                t_num(dt.getDate()) + ' ' + (months.length === 12 ? months[dt.getMonth()] : dt.getMonth()) + ' ' + dt.getFullYear();

            };
            gen_time_string();
            this.dt_interval = setInterval(gen_time_string, 1000);
          }
        }

        if (!this.status_checked) {
          this.status_checked = true;
        }
      } else if (msg.cmd === Cmd.StructModify) {
        const view = new Uint8Array(msg.data);
        const structure_type = view[8];
        switch (structure_type) {
          case 23: // STRUCT_TYPE_DEVICE_ITEM_VALUES
          case 24: // STRUCT_TYPE_GROUP_MODE
          case 25: // STRUCT_TYPE_GROUP_STATUS
          case 26: // STRUCT_TYPE_GROUP_PARAM_VALUE
            return;
        }

        this.connect_state = Connection_State.CS_CONNECTED_MODIFIED;

        if (!this.page_reload_dialog_ref) {
          this.page_reload_dialog_ref = this.dialog.open(PageReloadDialogComponent, {width: '80%', });
          this.page_reload_dialog_ref.afterClosed().subscribe(result => {
            if (result) {
              window.location.reload();
            }
            this.page_reload_dialog_ref = undefined;
          });
        }
      }
    });

    this.opened_sub = this.controlService.opened.subscribe(opened => {
      this.connection_str = this.getConnectionString(opened);

      if (opened) {
        this.controlService.getConnectInfo();
      } else {
        this.clearTime();
        this.connect_state = Connection_State.CS_DISCONNECTED;
      }
    });

    this.controlService.open();
  }

  restart(): void {
    if (this.can_edit) {
      this.controlService.restart();
    }
  }

  sidebarToggle() {
    this.snav.toggle();
    document.body.style.overflow = this.snav.opened && this.mobileQuery.matches? 'hidden' : 'auto';
    const rect = document.getElementsByClassName('house-toolbar')[0].getBoundingClientRect();
    this.snav.fixedTopGap = rect.bottom;
  }
}

@Component({
  templateUrl: './page-reload-dialog.component.html',
})
export class PageReloadDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<PageReloadDialogComponent>
  ) {
  }
}
