import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {SchemesService} from '../../schemes/schemes.service';
import {Group_User_Roles, User} from '../../user';
import {Device} from '../../scheme/scheme';
import {FormBuilder, FormGroup, ValidatorFn, Validators} from '@angular/forms';

@Component({
    selector: 'app-users-and-devices',
    templateUrl: './users-and-devices.component.html',
    styleUrls: ['./users-and-devices.component.css']
})
export class UsersAndDevicesComponent implements OnInit, OnChanges {
    readonly Group_User_Roles = Group_User_Roles;
    readonly displayedUsersColumns = ['name', 'username', 'role', 'control'];

    @Input() id: number;

    groupUsers: (User & { role: Group_User_Roles })[]; // TODO: fix type when backend will be ready
    groupDevices: Device[];

    userAddFg: FormGroup;
    deviceAddFg: FormGroup;
    devices: any[] = []; // TODO: fix type and fill data
    users: any[] = []; // TODO: fix type and fill data
    invitingUser = false;

    constructor(
        private schemes: SchemesService,
        fb: FormBuilder,
    ) {
        this.userAddFg = fb.group({
            email: [null, []],
            userId: [null, [Validators.required]],
            role: [null, [Validators.required]],
        }, {
            validators: [this.emailOrUserIdValidator()],
        });

        this.deviceAddFg = fb.group({
            deviceId: [null, [Validators.required]],
        });
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.id && changes.id.currentValue) {
            this.getData();
        }
    }

    private getData() {
        this.schemes.getSchemeGroupUsers(this.id).subscribe(users => this.groupUsers = users);
        this.schemes.getSchemeGroupSchemes(this.id).subscribe(devices => this.groupDevices = devices);
    }

    deviceAddFormSubmit() {
        if (this.deviceAddFg.invalid) return;

        this.schemes.addSchemeToSchemeGroup(this.id, this.deviceAddFg.value)
            .subscribe(() => this.getData());
    }

    userAddFormSubmit() {
        if (this.userAddFg.invalid) return;

        const user = this.userAddFg.value;
        this.schemes.addUserToSchemeGroup(this.id, user.id, user.role)
            .subscribe(() => this.getData());
    }

    removeUserFromGroup(user: User & { role: Group_User_Roles }) {
        this.schemes.removeUserFromSchemeGroup(this.id, user.id)
            .subscribe(() => this.getData());
    }

    removeDeviceFromGroup(device: Device) {
        this.schemes.removeSchemeFromSchemeGroup(this.id, device.id)
            .subscribe(() => this.getData());
    }

    emailOrUserIdValidator(): ValidatorFn {
        return (fg: FormGroup) => {
            const ctrl = this.invitingUser ? fg.controls.email : fg.controls.userId;

            if (ctrl.untouched || ctrl.invalid) {
                return { 'userRequired': true };
            }

            return null;
        };
    }

    toggleInvitingUser() {
        this.invitingUser = !this.invitingUser;

        const { userId, email } = this.userAddFg.controls;

        if (this.invitingUser) {
            userId.clearValidators();
            email.setValidators([Validators.required, Validators.email]);
        } else {
            email.clearValidators();
            userId.setValidators(Validators.required);
        }
    }
}
