import {AfterViewInit, Component, Inject, Input, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSnackBar} from '@angular/material';

import { SchemeService } from '../scheme.service';
import {Section, Device_Item, Device_Item_Group, DIG_Mode_Type, DIG_Param_Value} from '../scheme';
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
  schemeName: string;
  sections: Section[] = [];
  groupModes: DIG_Mode_Type[];

  is_view: boolean;

  currentSection: number;
  currentGroup: number;

  constructor(
    private route: ActivatedRoute,
    private schemeService: SchemeService,
    private controlService: ControlService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.schemeName = this.schemeService.scheme.name;
    this.groupModes = this.schemeService.scheme.dig_mode_type;

    this.is_view = this.route.snapshot.data['is_view'];

    const view = [];

    for (const sct of this.schemeService.scheme.section) {
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

  add_device_item(sct: Section, grp: Device_Item_Group, dev_item: Device_Item): void {
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

    let group: Device_Item_Group;
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
