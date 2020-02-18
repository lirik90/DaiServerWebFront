import {AfterViewInit, Component, Inject, Input, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSnackBar} from '@angular/material';

import { SchemeService } from '../scheme.service';
import {Section, Device_Item, Device_Item_Group, DIG_Mode_Type, DIG_Param_Value} from '../scheme';
import { ControlService } from '../control.service';
import {filter} from 'rxjs/operators';
import {AuthenticationService} from '../../authentication.service';
import {Location} from '@angular/common';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['../../sections.css', './manage.component.css']
})
export class ManageComponent implements OnInit, AfterViewInit {
  schemeName: string;
  sections: Section[] = [];
  groupModes: DIG_Mode_Type[];

  currentSection: number;
  currentGroup: number;

  canChangeMode: boolean;

  constructor(
    private route: ActivatedRoute,
    private schemeService: SchemeService,
    private authService: AuthenticationService,
    private controlService: ControlService,
    private router: Router,
    public dialog: MatDialog
  ) {
    router.events.subscribe(s => {
      if (s instanceof NavigationEnd) {
        const tree = router.parseUrl(router.url);
        if (tree.fragment) {
          const parsed = tree.fragment.match(/^section-(\d+)-group-(\d+)$/);
          if (parsed) {
            this.currentSection = parseInt(parsed[1], 10);
            this.currentGroup = parseInt(parsed[2], 10);

            this.scrollToGroup(this.currentGroup);
          }
        }
      }
    });
  }

  ngOnInit() {
    this.canChangeMode = this.authService.canChangeMode();

    this.schemeName = this.schemeService.scheme.name;
    this.groupModes = this.schemeService.scheme.dig_mode_type;
    this.sections = this.schemeService.scheme.section;
  }

  ngAfterViewInit(): void {
    this.scrollToGroup(this.currentGroup);
  }

  scrollToGroup(group_id: number) {
    const el = document.querySelector('#scheme-group-' + group_id);

    if (el) {
      setTimeout(() => {
        el.scrollIntoView({block: 'start', inline: 'center', behavior: 'smooth'});
      }, 200);
    }
  }

  changeDIGMode(mode_id: any, group_id: number): void {
    this.controlService.changeGroupMode(mode_id, group_id);
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
    this.dialog.open(ParamsDialogComponent, {panelClass: 'dig-param-dialog', width: '80%', data: { groupId: groupId }})
      .afterClosed().pipe(
      filter(name => name)
    ).subscribe(res => {
    });
  }
}

@Component({
  selector: 'app-params-dialog',
  templateUrl: './params-dialog.component.html',
  styleUrls: ['./manage.component.css'],
})

export class ParamsDialogComponent implements OnInit{
  groupId: number;

  sct: Section;
  group: Device_Item_Group = undefined;
  cantChange: boolean;

  changed_values: DIG_Param_Value[] = [];

  constructor(
    private route: ActivatedRoute,
    private schemeService: SchemeService,
    private authService: AuthenticationService,
    private controlService: ControlService,
    private location: Location,
    public dialogRef: MatDialogRef<ParamsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.groupId = data.groupId;
  }

  ngOnInit() {
    this.getGroup();
    this.cantChange = !this.authService.canChangeParam();
  }

  getGroup(): void {
    const groupId = this.groupId;
    for (const sct of this.schemeService.scheme.section) {
      for (const group of sct.groups) {
        if (group.id === groupId) {
          this.sct = sct;
          this.group = group;
          return;
        }
      }
    }
  }

  onSubmit() {
    console.log(this.changed_values);
    if (this.changed_values) {
      this.controlService.changeParamValues(this.changed_values);
    }
    this.close();
  }

  goBack(): void {
    console.log('BACK!');
    this.location.back();
  }

  close() {
    this.dialogRef.close();
  }
}
