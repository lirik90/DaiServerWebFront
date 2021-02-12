import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../authentication.service';
import {SchemeService} from '../scheme.service';
import {Device, Device_Item} from '../scheme';
import {MatDialog} from '@angular/material/dialog';
import {DeviceDetailDialogComponent} from '../manage/device-detail-dialog/device-detail-dialog.component';
import {DeviceItemDetailDialogComponent} from '../manage/device-item-detail-dialog/device-item-detail-dialog.component';
import {UIService} from '../../ui.service';

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
        private dialog: MatDialog,
        private ui: UIService,
    ) {
        this.isAdmin = this.authService.isAdmin();
        this.devices = this.schemeService.scheme.device;
    }

    ngOnInit(): void {
    }

    editDevice(device: Device) {
        this.dialog.open(DeviceDetailDialogComponent, { data: device })
            .afterClosed()
            .subscribe((newDevice: Device) => {
                // TODO: perform update request
            });
    }

    removeDevice(device: Device) {
        this.ui.confirmationDialog()
            .subscribe((confirmation: boolean) => {
                if (!confirmation) return;

                // TODO: perform delete request
            });
    }

    editItem(item: Device_Item) {
        this.dialog.open(DeviceItemDetailDialogComponent, { data: item })
            .afterClosed()
            .subscribe((updatedItem: Device_Item) => {
                // TODO: perform update request
            });
    }

    removeItem(item: Device_Item) {
        this.ui.confirmationDialog()
            .subscribe((confirmation) => {
                if (!confirmation) return;

                // TODO: perform delete request
            });
    }

    newItem(device: Device) {
        this.dialog.open(DeviceItemDetailDialogComponent, {
            data: {
                device_id: device.id,
            }
        })
            .afterClosed()
            .subscribe((newItem: Device_Item) => {
                // TODO: perform create request
            });
    }

    newDevice() {
        this.dialog.open(DeviceDetailDialogComponent, {})
            .afterClosed()
            .subscribe((device: Device) => {
                // TODO: create device.
            });
    }
}
