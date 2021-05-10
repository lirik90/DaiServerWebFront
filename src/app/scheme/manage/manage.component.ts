import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';

import {SchemeService} from '../scheme.service';
import {Device_Item, Device_Item_Group, Section} from '../scheme';
import {ControlService} from '../control.service';
import {AuthenticationService} from '../../authentication.service';
import {Section_Details, SectionDetailDialogComponent} from './section-detail-dialog/section-detail-dialog.component';
import {
    Device_Item_Group_Details,
    DeviceItemGroupDetailDialogComponent
} from './device-item-group-detail-dialog/device-item-group-detail-dialog.component';
import {UIService} from '../../ui.service';
import {Structure_Type} from '../settings/settings';

@Component({
    selector: 'app-manage',
    templateUrl: './manage.component.html',
    styleUrls: ['../../sections.css', './manage.component.css'],
})
export class ManageComponent implements OnInit, AfterViewInit {
    schemeName: string;
    sections: Section[] = [];

    currentSection: number;
    currentGroup: number;

    get isAdmin(): boolean {
        return this.authService.isAdmin();
    }

    isDisabled(): boolean {
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
        this.schemeName = this.schemeService.scheme.name;
        this.sections = this.schemeService.scheme.section;
        this.sctCount = this.sections.length;
        if (this.sctCount) {
            this.currentSection = this.sections[0].id;
        }
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

    restart(): void {
        this.controlService.restart();
    }

    newGroup(parentSection: Section) {
        this.dialog
            .open(DeviceItemGroupDetailDialogComponent, {width: '80%', data: { section_id: parentSection.id }})
            .afterClosed()
            .subscribe((group?: Device_Item_Group_Details) => {});
    }

    newItem(parentGroup: Device_Item_Group) {
        this.dialog
            .open(DeviceItemDetailDialogComponent, {width: '80%', data: { group_id: parentGroup.id, disableChangeGroupId: true }})
            .afterClosed()
            .subscribe((itemDetails?: Device_Item_Details) => {});
    }

    newSection() {
        this.dialog
            .open(SectionDetailDialogComponent, {width: '80%', data: null})
            .afterClosed()
            .subscribe((sectionDetails?: Section_Details) => {});
    }

    editSection(section: Section) {
        this.dialog
            .open(SectionDetailDialogComponent, {width: '80%', data: section})
            .afterClosed()
            .subscribe((sectionDetails?: Section_Details) => {});
    }

    editItem(item: Device_Item) {
        this.dialog
            .open(DeviceItemDetailDialogComponent, {width: '80%', data: { ...item, disableChangeGroupId: true }})
            .afterClosed()
            .subscribe((itemDetails?: Device_Item_Details) => {});
    }

    editGroup(group: Device_Item_Group) {
        this.dialog
            .open(DeviceItemGroupDetailDialogComponent, {width: '80%', data: group})
            .afterClosed()
            .subscribe((groupDetails?: Device_Item_Group_Details) => {});
    }

    removeSection(sct: Section) { // TODO: refactor remove methods below to use confirmationDialog().pipe() instead of nested subscribe
        this.ui.confirmationDialog()
            .subscribe((confirm) => {
                if (!confirm) {
                    return;
                }

                this.schemeService.remove_structure(Structure_Type.ST_SECTION, sct)
                    .subscribe(() => {});
            });
    }
}
