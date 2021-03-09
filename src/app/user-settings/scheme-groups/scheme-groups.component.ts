import {Component, OnInit} from '@angular/core';
import {Group_User_Roles, Scheme_Group} from '../../user';
import {SchemesService} from '../../schemes/schemes.service';
import {AuthenticationService} from '../../authentication.service';

@Component({
    selector: 'app-scheme-groups',
    templateUrl: './scheme-groups.component.html',
    styleUrls: ['./scheme-groups.component.css']
})
export class SchemeGroupsComponent implements OnInit {
    userSchemeGroups: Scheme_Group[];

    constructor(private schemes: SchemesService, private auth: AuthenticationService) {
    }

    ngOnInit(): void {
        this.fetchGroups();
    }

    addUserSchemeGroup($event: Scheme_Group & { role?: Group_User_Roles }) {
        this.schemes.addUserToGroupScheme($event.id, {
            id: this.auth.currentUser.id,
            role: $event.role,
        }).subscribe(() => this.fetchGroups());
    }

    removeSchemeGroup($event: Scheme_Group) {
        this.schemes.removeUserFromGroup($event.id, this.auth.currentUser.id)
            .subscribe(() => this.fetchGroups());
    }

    private fetchGroups() {
        this.schemes.getSchemeGroupsForUser(this.auth.currentUser)
            .subscribe(groups => this.userSchemeGroups = groups);
    }
}
