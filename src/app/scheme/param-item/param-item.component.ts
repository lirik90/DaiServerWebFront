import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';

import {SchemeService} from '../scheme.service';
import {DIG_Param, DIG_Param_Type, DIG_Param_Value_Type} from '../scheme';
import {FormControl, Validators} from '@angular/forms';

@Component({
    selector: 'app-param-item',
    templateUrl: './param-item.component.html',
    styleUrls: ['./param-item.component.css']
})
export class ParamItemComponent implements OnChanges {
    @Input() groupTypeId: number;
    @Input() groupId: number;
    @Input() values: DIG_Param[];
    @Input() changed: DIG_Param[];
    @Input() parent_param: DIG_Param_Type = null;
    @Input() editorModeEnabled = false;

    value_type = DIG_Param_Value_Type;
    params: DIG_Param_Type[];

    showForm = false;
    showNestedParamTypeForm = false;

    paramTypeIdFormControl: FormControl;
    paramTypeFormControl: FormControl;
    currentEditingParam: DIG_Param;

    constructor(
        private schemeService: SchemeService,
    ) {
        this.paramTypeFormControl = new FormControl(null, []);
        this.paramTypeIdFormControl = new FormControl(null, [Validators.required]);

        this.paramTypeIdFormControl.valueChanges.subscribe((v) => {
            this.showNestedParamTypeForm = v === 'new';

            if (this.showNestedParamTypeForm) {
                this.paramTypeFormControl.setValidators([Validators.required]);
            } else {
                this.paramTypeFormControl.clearValidators();
            }
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        const paramTypePatch: Partial<DIG_Param_Type> = {};

        if (changes.parent_param || changes.groupTypeId) {
            this.params = this.schemeService.scheme.dig_param_type.filter((param) => {
                if (param.group_type_id !== this.groupTypeId) return false;
                return (!this.parent_param && param.parent_id === null) || (this.parent_param?.id === param.parent_id);
            });

            if (changes.groupTypeId) {
                paramTypePatch.group_type_id = changes.groupTypeId.currentValue;
            }

            if (changes.parent_param) {
                paramTypePatch.parent_id = changes.parent_param.currentValue.id;
            }
        }

        if (Object.keys(paramTypePatch).length > 0) {
            this.paramTypeFormControl.setValue(paramTypePatch);
        }
    }

    isDisabled(p: DIG_Param): boolean {
        return this.schemeService.scheme.disabled_param.includes(p.param_id);
    }

    getTimeString(p: DIG_Param): string {
        let pad = (val: number) => {
            return ('0' + val.toFixed(0)).slice(-2);
        };
        let secs = parseInt(p.value);
        let h = pad(Math.floor(secs / 3600));
        secs %= 3600;
        let m = pad(Math.floor(secs / 60));
        return h + ':' + m + ':' + pad(secs % 60);
    }

    setTimeParam(p: DIG_Param, val: string): void {
        let arr = val.split(':');
        if (arr.length) {
            let v = parseInt(arr[0]) * 3600;
            let new_value = !Number.isNaN(v) ? v : 0;

            if (arr.length > 1) {
                v = parseInt(arr[1]) * 60;
            }
            new_value += !Number.isNaN(v) ? v : 0;

            if (arr.length > 2) {
                v = parseInt(arr[2]);
            }
            new_value += !Number.isNaN(v) ? v : 0;

            p.value = new_value.toString();
        }
    }

    change(item: DIG_Param, new_value: any): void {
        for (let param_value of this.changed) {
            if (param_value.id === item.id) {
                if (param_value.param.value_type === DIG_Param_Value_Type.VT_TIME) {
                    this.setTimeParam(param_value, new_value);
                } else if (param_value.value !== new_value) {
                    param_value.value = new_value;
                }
                return;
            }
        }

        const copy = {...item};
        if (item.param.value_type === DIG_Param_Value_Type.VT_TIME) {
            this.setTimeParam(copy, new_value);
        } else if (copy.value !== new_value) {
            copy.value = new_value;
        }

        this.changed.push(copy);
    }

    addParamForm() {
        this.resetForm();

        this.showForm = true;
    }

    editParamForm(param: DIG_Param) {
        this.resetForm();

        this.showForm = true;
        this.currentEditingParam = param;
        this.paramTypeIdFormControl.setValue(param.param_id);
    }

    removeParam(param: DIG_Param) {

    }

    submitForm() {
        if (this.showNestedParamTypeForm) {
            // TODO: createParamType (this.paramTypeFormControl.value) & call this.createParam(createdParam.id) in .subscribe()
        } else {
            if (this.paramTypeIdFormControl.valid) {
                this.createParam(this.paramTypeIdFormControl.value);
            }
        }
    }

    createParam(paramTypeId: number) {
        // TODO: create param with paramTypeId
        const param: Pick<DIG_Param, 'param_id' | 'group_id'> = {
            param_id: paramTypeId,
            group_id: this.groupId,
        };
    }

    resetForm() {
        if (this.showNestedParamTypeForm) {
            this.showNestedParamTypeForm = false;
        }

        this.showForm = false;
        this.currentEditingParam = null;
        this.paramTypeIdFormControl.reset();
    }
}
