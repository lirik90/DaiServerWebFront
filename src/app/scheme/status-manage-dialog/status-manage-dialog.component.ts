import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Device_Item_Group, DIG_Status_Type, Disabled_Status } from '../scheme';
import { SchemeService } from '../scheme.service';
import { SchemesService } from '../../schemes/schemes.service';
import { Auth_Group } from '../../user';

@Component({
  selector: 'app-status-manage-dialog',
  templateUrl: './status-manage-dialog.component.html',
  styleUrls: ['./status-manage-dialog.component.css']
})
export class StatusManageDialogComponent implements OnInit {
    name = "Test";
    value = 5;

    showCommon = false;

    displayedColumns = ['id', 'text', 'category', 'type', 'inform', 'block'];
    _types: DIG_Status_Type[];
    types: DIG_Status_Type[];

    authGroups: Auth_Group[];
    disabled: Disabled_Status[];

    get isLoading(): boolean {
        return this.disabled === undefined || this.authGroups === undefined;
    }

    constructor(
        public dialogRef: MatDialogRef<StatusManageDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public group: Device_Item_Group,
        private schemeService: SchemeService,
        private schemesService: SchemesService
    ) { }

    ngOnInit(): void {
        const tmp = () => {
            if (this.isLoading)
                return;
            const scheme_id = this.schemeService.scheme.id;
            this.disabled.push({ id: 1, group_id: null,                  dig_id: null,          status_id: 0,                 scheme_id: this.schemeService.scheme.parent_id });
            this.disabled.push({ id: 2, group_id: null,                  dig_id: this.group.id, status_id: this._types[1].id, scheme_id });
            this.disabled.push({ id: 3, group_id: null,                  dig_id: null,          status_id: this._types[2].id, scheme_id });
            this.disabled.push({ id: 4, group_id: this.authGroups[0].id, dig_id: this.group.id, status_id: this._types[3].id, scheme_id });
            this.disabled.push({ id: 5, group_id: this.authGroups[1].id, dig_id: null,          status_id: this._types[4].id, scheme_id });
            this.disabled.push({ id: 6, group_id: this.authGroups[2].id, dig_id: this.group.id, status_id: this._types[3].id, scheme_id });
            this.disabled.push({ id: 7, group_id: this.authGroups[0].id, dig_id: null,          status_id: this._types[4].id, scheme_id });
            this.disabled.push({ id: 7, group_id: this.authGroups[0].id, dig_id: null,          status_id: this._types[4].id, scheme_id });
            this.disabled.push({ id: 7, group_id: this.authGroups[0].id, dig_id: null,          status_id: this._types[4].id, scheme_id });
            this.disabled.push({ id: 7, group_id: this.authGroups[0].id, dig_id: null,          status_id: this._types[4].id, scheme_id });
            this.disabled.push({ id: 7, group_id: this.authGroups[0].id, dig_id: null,          status_id: this._types[4].id, scheme_id });
        };

        this.schemesService.getAuthGroups().subscribe(items => { this.authGroups = items; tmp(); });
        this.schemeService.getDisabledStatuses(this.group.id).subscribe(items => { this.disabled = items; tmp(); });

        this._types = this.schemeService.scheme.dig_status_type.filter(type => type.group_type_id === null || type.group_type_id === this.group.type_id);
        this._types = this._types.sort((t1, t2) => t1.group_type_id < t2.group_type_id ? -1 :
                                                 t1.group_type_id > t2.group_type_id ? 1 : 0);
        this._types.splice(0, 1, { id: 0, group_type_id: null, text: 'Подключен/Отключен', category: { title: 'Инфо', color: 'blue' }, inform: true } as DIG_Status_Type);
        this.showCommonToggle();
        // TODO: Может быть заблокирован для какой то Auth_Group или для всех. Для какой то DIG или для всех. Для текущей схемы или для управляющей.
        // Если заблокированно для управляющей схемы, то остальное не актуально, тут максимальный приоритет.
        // Варианты (столбец Блокировка):
        // Нет
        // По управляющей схеме
        // Для этой группы
        // Для всех групп
        // Для этой группы у "Admins"
        // Для всех групп у "Users"
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    showCommonToggle(): void {
        this.types = this._types.filter(type => type.group_type_id !== null || this.showCommon);
        if (this.showCommon)
            this.displayedColumns.splice(3, 0, 'type');
        else
            this.displayedColumns.splice(3, 1);
    }

    getDisabledText(type: DIG_Status_Type): string
    {
        if (this.isLoading || !type.inform)
            return '';

        let text = [];
        for (const disabled of this.disabled)
        {
            if (disabled.status_id == type.id)
            {
                if (disabled.scheme_id !== this.schemeService.scheme.id)
                    return "По управляющей схеме";

                if (disabled.dig_id != null && disabled.dig_id != this.group.id)
                    continue;

                let item = disabled.dig_id == this.group.id ? "Для этой группы" : "Для всех групп";
                if (disabled.group_id)
                    item += ' у "' + this.getAuthGroupName(disabled.group_id) + '"';
                text.push(item);
            }
        }

        if (!text.length)
            return "Нет";
        return text.join("\n");
    }

    getAuthGroupName(id: number): string
    {
        for (const group of this.authGroups)
            if (group.id == id)
                return group.name;
        return "Unknown";
    }
}
