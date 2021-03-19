import {Component, Input, OnInit, OnChanges, SimpleChanges} from '@angular/core';

import {SchemeService} from '../../scheme.service';
import {Device_Item_Group, DIG_Param, DIG_Param_Type, DIG_Type, Section} from '../../scheme';
import {SettingsService} from '../../settings.service';
import {ChangeInfo, ChangeState, ChangeTemplate, Structure_Type} from '../settings';
import {UIService} from '../../../ui.service';

@Component({
    selector: 'app-sections',
    templateUrl: './sections.component.html',
    styleUrls: ['../settings.css', './sections.component.css']
})
export class SectionsComponent extends ChangeTemplate<Section> implements OnInit {
    constructor(
        schemeService: SchemeService,
        private settingsService: SettingsService,
        ui: UIService,
    ) {
        super(schemeService, Section, Structure_Type.ST_SECTION, ui);
    }

    getObjects(): Section[] {
        return this.schemeService.scheme.section;
    }

    ngOnInit() {
        this.fillItems();

        /*
        // Dialog
        this.sections = this.sections.filter(s => s !== sct);
        this.settingsService.deleteSection(sct).subscribe(_ => {
          // this.controlService.deleteSection(sct);
        });*/
    }
}

@Component({
    selector: 'app-groups',
    templateUrl: './groups.component.html',
    styleUrls: ['../settings.css', './sections.component.css']
})
export class GroupsComponent extends ChangeTemplate<Device_Item_Group> implements OnInit {
    @Input() sct: Section;

    groupTypes: DIG_Type[];

    constructor(
        schemeService: SchemeService,
        ui: UIService,
    ) {
        super(schemeService, Device_Item_Group, Structure_Type.ST_DEVICE_ITEM_GROUP, ui);
    }

    getObjects(): Device_Item_Group[] {
        return this.sct.groups;
    }

    ngOnInit() {
        this.groupTypes = this.schemeService.scheme.dig_type;
        this.fillItems();
    }

    title(item: Device_Item_Group = undefined): string {
        if (item === undefined) {
            item = this.sel_item.obj;
        }
        return item.title ? item.title : (item.type ? item.type.title : '');
    }

    initItem(obj: Device_Item_Group): void {
        obj.section_id = this.sct.id;
    }
}

@Component({
    selector: 'app-params-in-group',
    templateUrl: './params-in-group.component.html',
    styleUrls: ['../settings.css', './sections.component.css']
})
export class ParamsInGroupComponent extends ChangeTemplate<Omit<DIG_Param, 'value'>> implements OnChanges {
    @Input() group: Device_Item_Group;

    params: DIG_Param_Type[];

    constructor(
        schemeService: SchemeService,
        ui: UIService,
    ) {
        super(schemeService, DIG_Param, Structure_Type.ST_DIG_PARAM, ui);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.group) {
            this.fillItems();
            this.params = this.schemeService.scheme.dig_param_type.filter(obj => obj.group_type_id === this.group.type_id);
        }
    }

    addItem(obj: Omit<DIG_Param, 'value'>, select: boolean = true) {
        const item: ChangeInfo<Omit<DIG_Param, 'value'>> = {
            state: ChangeState.NoChange,
            obj: {
                id: obj.id,
                group_id: obj.group_id,
                param_id: obj.param_id,
                param: obj.param,
                childs: obj.childs,
            },
        };

        this.items.push(item);

        if (select) {
            this.sel_item = item;
        }

        obj.childs?.forEach(child => this.addItem(child, false));
    }

    getObjects(): Omit<DIG_Param, 'value'>[] {
        return this.group.params;
    }

    initItem(obj: DIG_Param): void {
        obj.param = new DIG_Param_Type();
        obj.group_id = this.group.id;
    }
}
