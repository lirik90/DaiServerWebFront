import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {AuthGuard} from '../../auth.guard';

import {SettingsComponent} from './settings.component';
import {DevicesComponent} from './devices/devices.component';
import {SectionsComponent} from './sections/sections.component';
import {GroupTypesComponent} from './group-types/group-types.component';
import {DIG_Status_Category_Component} from './dig-status-category/dig-status-category.component';
import {SignTypesComponent} from './sign-types/sign-types.component';
import {Code_Item_Component} from './codes/codes.component';
import {PluginTypesComponent} from './plugin-types/plugin-types.component';
import {SaveTimersComponent} from './save-timers/save-timers.component';
import {DigModeTypeComponent} from './dig-mode-type/dig-mode-type.component';
import {TranslationComponent} from './translation/translation.component';
import {ValueViewComponent} from './value-view/value-view.component';

const settingsRoutes: Routes = [
    {
        path: '',
        canActivate: [AuthGuard],
        component: SettingsComponent,
        children: [
            {path: '', pathMatch: 'full'},
            {path: 'devices', component: DevicesComponent},
            {
                path: 'sections',
                children: [
                    {path: '', component: SectionsComponent, pathMatch: 'full'},
                    {
                        path: ':sctId',
                        children: [
                            {path: '', component: SectionsComponent, pathMatch: 'full'},
                            {path: 'group/:groupId', component: SectionsComponent},
                        ]
                    }
                ]
            },
            {path: 'grouptypes', component: GroupTypesComponent},
            {path: 'dig_status_category', component: DIG_Status_Category_Component},
            {path: 'signtypes', component: SignTypesComponent},
            {path: 'plugin_type', component: PluginTypesComponent},
            {path: 'savetimers', component: SaveTimersComponent},
            {path: 'codes', component: Code_Item_Component},
            {path: 'dig_mode_type', component: DigModeTypeComponent},
            {path: 'translation', component: TranslationComponent},
            {path: 'value_view', component: ValueViewComponent},
        ]
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(settingsRoutes)
    ],
    exports: [
        RouterModule
    ]
})
export class SettingsRoutingModule {
}
