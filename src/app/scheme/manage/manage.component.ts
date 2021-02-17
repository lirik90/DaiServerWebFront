import {AfterViewInit, Component, Inject, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {MAT_DIALOG_DATA, MAT_DIALOG_DEFAULT_OPTIONS, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {filter} from 'rxjs/operators';

import { SchemeService } from '../scheme.service';
import {Section, Device_Item, Device_Item_Group, DIG_Mode_Type, DIG_Param, Value_View} from '../scheme';
import { ControlService } from '../control.service';
import {AuthenticationService} from '../../authentication.service';
import {Subscription} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Section_Details, SectionDetailDialogComponent} from './section-detail-dialog/section-detail-dialog.component';
import {
  Device_Item_Group_Details,
  DeviceItemGroupDetailDialogComponent
} from './device-item-group-detail-dialog/device-item-group-detail-dialog.component';
import {Device_Item_Details, DeviceItemDetailDialogComponent} from './device-item-detail-dialog/device-item-detail-dialog.component';
import {UIService} from '../../ui.service';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['../../sections.css', './manage.component.css'],
})
export class ManageComponent implements OnInit, AfterViewInit {
  schemeName: string;
  sections: Section[] = [];
  groupModes: DIG_Mode_Type[];

  currentSection: number;
  currentGroup: number;

  canChangeMode: boolean;

    get isAdmin(): boolean
    {
        return this.authService.isAdmin();
    }

  isDisabled(): boolean
  {
      return !this.schemeService.isSchemeConnected;
  }

  sctCount: number;
  isEditorModeEnabled: boolean;

  constructor(
    private route: ActivatedRoute,
    private schemeService: SchemeService,
    private authService: AuthenticationService,
    private controlService: ControlService,
    private router: Router,
    public dialog: MatDialog,
    private ui: UIService,
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
    this.sctCount = this.sections.length;
    if (this.sctCount)
      this.currentSection = this.sections[0].id;
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
    this.dialog.open(ParamsDialogComponent, {
        panelClass: 'dig-param-dialog',
        width: '80%',
        data: { groupId: groupId, isEditorModeEnabled: this.isEditorModeEnabled },
    })
        .afterClosed()
        .pipe(filter(name => name))
        .subscribe(res => {
        });
  }

  restart(): void {
    this.controlService.restart();
  }

  newGroup(parentSection: Section) {
    this.dialog
      .open(DeviceItemGroupDetailDialogComponent, { width: '80%', data: null })
      .afterClosed()
      .subscribe((group?: Device_Item_Group_Details) => {
        if (!group) return;

        // TODO: create group
      })
  }

  newItem(parentGroup: Device_Item_Group) {
    this.dialog
      .open(DeviceItemDetailDialogComponent, { width: '80%', data: null })
      .afterClosed()
      .subscribe((itemDetails?: Device_Item_Details) => {
        if (!itemDetails) return;

        // TODO: create item
      });
  }

  newSection() {
    this.dialog
      .open(SectionDetailDialogComponent, { width: '80%', data: null })
      .afterClosed()
      .subscribe((sectionDetails?: Section_Details) => {
        if (!sectionDetails) return;

        // TODO: create section
      });
  }

  editSection(section: Section) {
    this.dialog
      .open(SectionDetailDialogComponent, { width: '80%', data: section })
      .afterClosed()
      .subscribe((sectionDetails?: Section_Details) => {
        if (!sectionDetails) return;

        // TODO: update section
      });
  }

  editItem(item: Device_Item) {
    this.dialog
      .open(DeviceItemDetailDialogComponent, { width: '80%', data: item })
      .afterClosed()
      .subscribe((itemDetails?: Device_Item_Details) => {
        if (!itemDetails) return;
        // TODO: update item
      });
  }

  editGroup(group: Device_Item_Group) {
    this.dialog
      .open(DeviceItemGroupDetailDialogComponent, { width: '80%', data: group })
      .afterClosed()
      .subscribe((groupDetails?: Device_Item_Group_Details) => {
        if (!groupDetails) return;
        // TODO: update group
      });
  }

  removeSection(sct: Section) {
    this.ui.confirmationDialog()
      .subscribe((confirm) => {
        if (!confirm) return;

        // TODO: remove section
      });
  }

  removeGroup(group: Device_Item_Group) {
    this.ui.confirmationDialog()
      .subscribe((confirm) => {
        if (!confirm) return;

        // TODO: remove group
      });
  }

  removeItem(item: Device_Item) {
    this.ui.confirmationDialog()
      .subscribe((confirm) => {
        if (!confirm) return;
      });
  }
}

@Component({
  selector: 'app-params-dialog',
  templateUrl: './params-dialog.component.html',
  styleUrls: ['./manage.component.css'],
})
export class ParamsDialogComponent implements OnInit {
  pending = false;

  groupId: number;

  sct: Section;
  group: Device_Item_Group = undefined;
  isEditorModeEnabled: boolean;
  cantChange: boolean;

  changed_values: DIG_Param[] = [];
  private group_param_values_changed$: Subscription;
  private changing_timeout: number;
  private unsaved_params_ids: number[];

  constructor(
      private route: ActivatedRoute,
      public schemeService: SchemeService,
      private authService: AuthenticationService,
      private controlService: ControlService,
      private location: Location,
      public dialogRef: MatDialogRef<ParamsDialogComponent>,
      private snackBar: MatSnackBar,
      @Inject(MAT_DIALOG_DATA) public data: { groupId: number, isEditorModeEnabled: boolean },
  ) {
    this.groupId = data.groupId;
    this.isEditorModeEnabled = data.isEditorModeEnabled;
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

  onEnter(e: any): void {
    e.preventDefault();
    let control: any;
    control = e.srcElement.parentElement;
    control = control.parentElement;
    control = control.parentElement;
    control = control.parentElement;
    if (control.nextElementSibling)
    {
      control = control.nextElementSibling;
    }
    else
    {
      control = control.parentElement;
      control = control.parentElement;
      control = control.nextElementSibling;
    }

    let findNode = (control: any):boolean => {
      if (!control)
        return;
      if ((!control.hidden) &&
         (control.nodeName == 'INPUT' ||
          control.nodeName == 'SELECT' ||
          control.nodeName == 'BUTTON' ||
          control.nodeName == 'TEXTAREA'))
         {
           control.focus();
           return true;
         }

      for (const node of control.childNodes)
        if (findNode(node))
          return true;
      return false;
    };

    findNode(control);
  }

  onSubmit() {
    if (!this.schemeService.isSchemeConnected) return;

    console.log('param form submit', this.changed_values);
    if (this.changed_values) {
        this.pending = true;
        this.group_param_values_changed$ = this.controlService.group_param_values_changed.subscribe((changed_params: DIG_Param[]) => {
            if (!this.unsaved_params_ids) {
                this.unsaved_params_ids = this.changed_values.map(p => p.id);
            }

            this.clear_changing_timeout();
            this.unsaved_params_ids = this.unsaved_params_ids.filter(id => !changed_params.find(p => p.id === id));

            if (this.unsaved_params_ids.length === 0) {
                this.pending = false;
                this.close();
            }
        });
        this.set_changing_timeout();
        this.controlService.changeParamValues(this.changed_values);
    }
  }

  goBack(): void {
    console.log('BACK!');
    this.location.back();
  }

  close() {
    this.dialogRef.close();
  }

    private set_changing_timeout() {
        this.changing_timeout = window.setTimeout(() => {
            this.group_param_values_changed$.unsubscribe();

            if (this.unsaved_params_ids?.length > 0) {
                this.changing_error_unchanged();
            } else {
                this.changing_error_timeout();
            }
        }, 10000);
    }

    private clear_changing_timeout() {
        clearTimeout(this.changing_timeout);
    }

    private changing_error_unchanged() {
        this.pending = false;

        this.snackBar.open('Не все значения изменены', 'Скрыть', {
            duration: 10000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
        });
    }

    private changing_error_timeout() {
        this.pending = false;

        this.snackBar.open('Тайм-аут обновления', 'Скрыть', {
            duration: 10000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
        });
    }
}
