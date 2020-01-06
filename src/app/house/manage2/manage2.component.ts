import {AfterViewInit, Component, Inject, Input, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSnackBar} from '@angular/material';

import { HouseService } from '../house.service';
import {Section, DeviceItem, Group, GroupMode, ParamValue} from '../house';
import { ControlService } from '../control.service';
import {filter} from 'rxjs/operators';
import {AuthenticationService} from '../../authentication.service';
import {Location} from '@angular/common';
import {ParamsDialogComponent} from '../manage/manage.component';

@Component({
  selector: 'app-manage',
  templateUrl: './manage2.component.html',
  styleUrls: ['../../sections.css', './manage2.component.css']
})
export class Manage2Component implements OnInit {
  houseName: string;
  sections: Section[] = [];
  groupModes: GroupMode[];

  is_view: boolean;

  currentSection: number;
  currentGroup: number;

  constructor(
    private route: ActivatedRoute,
    private houseService: HouseService,
    private controlService: ControlService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.houseName = this.houseService.house.name;
    this.groupModes = this.houseService.house.groupModes;

    this.is_view = this.route.snapshot.data['is_view'];

    const view = [];

    for (const sct of this.houseService.house.sections) {
      for (const group of sct.groups) {
        for (const dev_item of group.items) {
          // tslint:disable-next-line:forin
          for (const i in view) {
            const view_item = view[i];
            if (view_item === dev_item.type.name) {
              this.add_device_item(sct, group, dev_item);
              // view.splice(parseInt(i, 10), 1);
              break;
            }
          }
        }
      }
    }
  }

  add_device_item(sct: Section, grp: Group, dev_item: DeviceItem): void {
    let section: Section;
    for (const sct_item of this.sections) {
      if (sct_item.id === sct.id) {
        section = sct_item;
        break;
      }
    }

    if (!section) {
      section = Object.assign({}, sct);
      section.groups = [];
      this.sections.push(section);
    }

    let group: Group;
    for (const grp_item of section.groups) {
      if (grp_item.id === grp.id) {
        group = grp_item;
        break;
      }
    }

    if (!group) {
      group = Object.assign({}, grp);
      group.items = [];
      section.groups.push(group);
    }

    group.items.push(dev_item);
  }

  openParamsDialog(groupId) {
    this.dialog.open(ParamsDialogComponent, {width: '80%', data: { groupId: groupId }})
      .afterClosed().pipe(
      filter(name => name)
    ).subscribe(res => {
    });
  }
}
