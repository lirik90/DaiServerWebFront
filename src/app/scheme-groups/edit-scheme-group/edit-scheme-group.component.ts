import {Component, OnInit} from '@angular/core';
import {Scheme_Group} from '../../user';
import {SchemesService} from '../../schemes/schemes.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
    selector: 'app-edit-scheme-group',
    templateUrl: './edit-scheme-group.component.html',
    styleUrls: ['./edit-scheme-group.component.css']
})
export class EditSchemeGroupComponent implements OnInit {
    group: Scheme_Group;

    constructor(private schemes: SchemesService, route: ActivatedRoute, private router: Router) {
        route.paramMap.subscribe((p) => {
            const id = p.get('id');
            if (id === 'new') {
                this.group = null;
            } else {
                this.schemes.getSchemeGroup(+id)
                    .subscribe(group => this.group = group);
            }
        });
    }

    ngOnInit(): void {
    }

    groupChanged($event: Scheme_Group) {
        if ($event.id !== this.group.id) {
            this.router.navigate(['group', $event.id]);
        }
    }
}
