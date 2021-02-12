import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../authentication.service';
import {SchemeService} from '../scheme.service';
import {Device} from '../scheme';

@Component({
    selector: 'app-manage-devices',
    templateUrl: './manage-devices.component.html',
    styleUrls: ['./manage-devices.component.css', '../manage/manage.component.css']
})
export class ManageDevicesComponent implements OnInit {
    isEditorModeEnabled = false;
    isAdmin: boolean;

    devices: Device[];

    constructor(
        private authService: AuthenticationService,
        private schemeService: SchemeService,
    ) {
        this.isAdmin = this.authService.isAdmin();
        this.devices = this.schemeService.scheme.device;
    }

    ngOnInit(): void {
    }

}
