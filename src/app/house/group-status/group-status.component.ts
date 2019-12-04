import {Component, OnInit, Input, ViewChild, OnChanges, SimpleChanges, DoCheck, ChangeDetectorRef} from '@angular/core';
import {MatPaginator, MatTooltip} from '@angular/material';

import {Group, GroupStatusInfo} from '../house';

@Component({
  selector: 'app-group-status',
  templateUrl: './group-status.component.html',
  styleUrls: ['./group-status.component.css']
})
export class GroupStatusComponent implements OnInit {

  @Input() group: Group;

  @ViewChild(MatTooltip, {static: false}) tooltip;

  get color(): string {
    if (this.group.status_info === undefined)
      return 'gray';
    return this.group.status_info.color;
  }

  get text(): string {
    if (this.group.status_info === undefined)
      return '?';
    return this.group.status_info.text;
  }

  get short_text(): string {
    if (this.group.status_info === undefined)
      return '?';
    return this.group.status_info.short_text;
  }

  constructor(
    private ref: ChangeDetectorRef
  ) { }

  ngOnInit() {
    //console.log(this.group);
  }

  /*
  ngOnChanges(changes: SimpleChanges): void {
    //console.log(changes);
  }

  ngDoCheck() {
    if (this.group.status_info !== this.old_status_info) {
      console.log('a');
      this.ref.markForCheck();
    }
  }
  */

  showStatusText(evnt: any): void {
    evnt.stopPropagation();
    this.tooltip.show();
  }
}
