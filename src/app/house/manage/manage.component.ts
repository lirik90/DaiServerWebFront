import {AfterViewInit, Component, Inject, Input, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSnackBar} from '@angular/material';

import { HouseService } from '../house.service';
import {Section, DeviceItem, Group, GroupMode, ParamValue} from '../house';
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
    this.houseName = this.houseService.house.name;
    this.groupModes = this.houseService.house.groupModes;

    this.is_view = this.route.snapshot.data['is_view'];
    if (this.is_view) {
      this.route.params.subscribe(params => {
        const view_id = params['view_id'];
        this.get_view_item(view_id);
      });
    } else {
      this.sections = this.houseService.house.sections;
    }
  }

  ngAfterViewInit(): void {
    this.scrollToGroup(this.currentGroup);
  }

  scrollToGroup(group_id: number) {
    const el = document.querySelector('#house-group-' + group_id);

    if (el) {
      setTimeout(() => {
        el.scrollIntoView({block: 'start', inline: 'center', behavior: 'smooth'});
      }, 200);
    }
  }

  get_view_item(view_id: number): void {
    this.sections = [];
    this.houseService.getViewItems(view_id).subscribe(api => {
      for (const sct of this.houseService.house.sections) {
        for (const group of sct.groups) {
          for (const dev_item of group.items) {
            // tslint:disable-next-line:forin
            for (const i in api.results) {
              const view_item = api.results[i];
              if (view_item.item_id === dev_item.id) {
                this.add_device_item(sct, group, dev_item);
                api.results.splice(parseInt(i, 10), 1);
                break;
              }
            }
          }
        }
      }
    });
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

@Component({
  selector: 'app-params-dialog',
  templateUrl: './params-dialog.component.html',
  styleUrls: ['./manage.component.css'],
})

export class ParamsDialogComponent implements OnInit{
  groupId: number;

  sct: Section;
  group: Group = undefined;
  cantChange: boolean;

  changed_values: ParamValue[] = [];

  constructor(
    private route: ActivatedRoute,
    private houseService: HouseService,
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
    for (const sct of this.houseService.house.sections) {
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
