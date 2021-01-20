import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SchemesService} from '../../schemes/schemes.service';
import {Scheme_Group} from '../../user';

@Component({
    selector: 'app-create-new-scheme-group',
    templateUrl: './create-new-scheme-group.component.html',
    styleUrls: ['./create-new-scheme-group.component.css']
})
export class CreateNewSchemeGroupComponent implements OnInit, OnChanges {
    @Input() group: Scheme_Group;
    @Output() groupChanged: EventEmitter<Scheme_Group> = new EventEmitter();

    fg: FormGroup;

    constructor(
        fb: FormBuilder,
        private schemesService: SchemesService,
    ) {
        this.fg = fb.group({
            id: [null, []],
            name: ['', [Validators.required]],
        });
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.group) {
            if (changes.group.currentValue) {
                this.fg.setValue(changes.group.currentValue);
            } else {
                this.fg.reset();
            }
        }
    }

    submit() {
        if (this.fg.invalid) return;

        if (this.fg.value.id) {
            this.schemesService.updateSchemeGroup(this.fg.value)
                .subscribe((group) => this.groupChanged.emit(group));
        } else {
            this.schemesService.createSchemeGroup(this.fg.value)
                .subscribe((group) => this.groupChanged.emit(group));
        }
    }

    remove(group: Scheme_Group) {
        this.schemesService.removeSchemeGroup(group.id)
            .subscribe(() => null);
    }
}
