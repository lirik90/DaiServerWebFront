import {Component, OnInit} from '@angular/core';
import {Value_View} from '../../scheme';
import {ChangeTemplate, Structure_Type} from '../settings';
import {SchemeService} from '../../scheme.service';
import {SettingsService} from '../../settings.service';

@Component({
    selector: 'app-value-view',
    templateUrl: './value-view.component.html',
    styleUrls: ['./value-view.component.css']
})
export class ValueViewComponent extends ChangeTemplate<any> implements OnInit {
    value_views: any;

    constructor(schemeService: SchemeService, private settingsService: SettingsService) {
        super(schemeService, {}, Structure_Type.ST_VALUE_VIEW);
        this.settingsService.getValueView().subscribe(d => this.value_views = d);
    }

    ngOnInit(): void {
    }

    getObjects(): Value_View[] {
        return [];
    }
}
