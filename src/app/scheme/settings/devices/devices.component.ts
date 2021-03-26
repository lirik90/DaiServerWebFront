import {Component, Input, OnChanges, OnInit} from '@angular/core';

import {Device, Device_Item, Device_Item_Type, Plugin_Type, Section} from '../../scheme';
import {SchemeService} from '../../scheme.service';

import {ChangeInfo, ChangeState, ChangeTemplate, Structure_Type} from '../settings';
import {UIService} from '../../../ui.service';
import {SettingsService} from '../../settings.service';

abstract class WithPlugin<T extends { id: number, extra: string }> extends ChangeTemplate<T> {
    plugins: Plugin_Type[];
    editingExtraFields: { title: string, value: string }[];

    protected constructor(
        schemeService: SchemeService,
        itemType: new () => T,
        settingName: Structure_Type,
        ui: UIService,
        settingsService: SettingsService,
    ) {
        super(schemeService, itemType, settingName, ui);
        settingsService.getPluginTypes().subscribe(plugins => this.plugins = plugins.results);
    }

    public pluginChanged(pluginId: number, extra: string, isItem: boolean = false) {
        this.editingExtraFields = [];
        const selectedPlugin = this.plugins.find(p => p.id === pluginId);
        if (selectedPlugin) {
            const fields = selectedPlugin[isItem ? 'param_names_device_item' : 'param_names_device'];

            if (fields) {
                const parsedExtra = JSON.parse(extra) as Array<string>;

                this.editingExtraFields = fields
                    .split('|')
                    .map((title, idx) => ({
                        title,
                        value: parsedExtra[idx],
                    }));
            }
        }
    }

    public extraChanged(idx: number, val: string) {
        this.editingExtraFields[idx].value = val;
        this.sel_item.obj.extra = JSON.stringify(this.editingExtraFields.map(f => f.value));
        this.itemChanged();
    }
}

@Component({
    selector: 'app-devices',
    templateUrl: './devices.component.html',
    styleUrls: ['../settings.css', './devices.component.css']
})
export class DevicesComponent extends WithPlugin<Device> implements OnInit {
    constructor(
        schemeService: SchemeService,
        ui: UIService,
        settingsService: SettingsService,
    ) {
        super(schemeService, Device, Structure_Type.ST_DEVICE, ui, settingsService);
    }

    getObjects(): Device[] {
        return this.schemeService.scheme.device;
    }

    ngOnInit() {
        this.fillItems();
    }

    select(item: ChangeInfo<Device>) {
        super.select(item);
        if (!this.sel_item) {
            return;
        }

        this.pluginChanged(item.obj.plugin_id, item.obj.extra);
    }

    initItem(obj: Device): void {
        obj.extra = null;
        obj.check_interval = 0;
    }
}

@Component({
    selector: 'app-deviceitems',
    templateUrl: './deviceitems.component.html',
    styleUrls: ['../settings.css', './devices.component.css']
})
export class DeviceItemsComponent extends WithPlugin<Device_Item> implements OnInit, OnChanges {
    @Input() dev: Device;

    itemtypes: Device_Item_Type[];
    sections: Section[];
    private groupSelected = false;
    private typeSelected = false;

    constructor(
        schemeService: SchemeService,
        ui: UIService,
        settingsService: SettingsService,
    ) {
        super(schemeService, Device_Item, Structure_Type.ST_DEVICE_ITEM, ui, settingsService);
        // TODO: исправить баг со списком групп из одной надписи. Раньше проблема была только при отмене редактирования.
    }

    getObjects(): Device_Item[] {
        return this.dev.items;
    }

    ngOnInit() {
        this.init();
    }

    ngOnChanges() {
        this.init()
    }

    title(item: Device_Item): string {
        if (!item) {
            item = this.sel_item.obj;
        }
        if (item.name.length) {
            return item.name;
        } else if (item.type && item.type.title.length) {
            return item.type.title;
        }
        return '';
    }

    typeChanged(): void {
        this.itemChanged();

        if (this.sel_item.obj.type_id > 0) {
            for (const itemtype of this.itemtypes) {
                if (this.sel_item.obj.type_id === itemtype.id) {
                    this.sel_item.obj.type = itemtype;
                    break;
                }
            }
        }

        this.filterGroups();
    }

    groupChanged(): void {
        this.itemChanged();

        if (this.typeSelected) {
            return;
        }
        this.groupSelected = true;
        let group;
        if (!group) {
            this.itemtypes = this.schemeService.scheme.device_item_type;
            return;
        }
        this.schemeService.scheme.section
            .find((section) => {
                group = section.groups.find(gr => gr.id === this.sel_item.obj.group_id);
                return !!group;
            });

        this.itemtypes = this.schemeService.scheme.device_item_type.filter(type => type.group_type_id === group.type_id);
        const foundType = !!this.itemtypes.find(itemType => itemType.id === this.sel_item.obj.type_id);

        if (!foundType) {
            this.sel_item.obj.type_id = 0;
        }
    }

    initItem(obj: Device_Item): void {
        obj.name = '';
        obj.device_id = this.dev.id;
        obj.type_id = 0;
        obj.extra = null;
    }

    select(item: ChangeInfo<Device_Item>) {
        this.reset();
        super.select(item);
        if (!this.sel_item) {
            return;
        }

        this.pluginChanged(this.dev.plugin_id, this.sel_item.obj.extra, true);
    }

    cancel(evnt: any = undefined) {
        this.sel_item.obj.type_id = this.sel_item.prev.type_id; // restore type_id and group_id if it reset
        this.sel_item.obj.group_id = this.sel_item.prev.group_id;

        super.cancel(evnt);
    }

    addItem(obj: Device_Item, select: boolean = true) {
        let item = {state: ChangeState.NoChange, obj: obj, prev: {...obj}} as ChangeInfo<Device_Item>;
        this.items.push(item);
        if (select) {
            this.sel_item = item;
        }
    }

    private filterGroups() {
        if (this.groupSelected) {
            return;
        }

        this.typeSelected = true;

        if (!this.sel_item.obj.type) {
            this.sections = this.schemeService.scheme.section;
        }

        let found = false;
        this.sections = this.schemeService.scheme.section
            .map((section) => {
                const groups = section.groups.filter(group => group.type_id === this.sel_item.obj.type.group_type_id);
                if (!groups.length) {
                    return null;
                }

                if (!!groups.find(g => g.id === this.sel_item.obj.group_id)) {
                    found = true;
                }

                return {
                    ...section,
                    groups,
                };
            })
            .filter(t => !!t);

        if (!found) {
            this.sel_item.obj.group_id = 0;
        }
    }

    private init() {
        this.reset();
        this.fillItems();
    }

    private reset() {
        this.groupSelected = false;
        this.typeSelected = false;
        this.itemtypes = this.schemeService.scheme.device_item_type;
        this.sections = this.schemeService.scheme.section;
    }
}
