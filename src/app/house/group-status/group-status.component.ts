import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MatTooltip } from "@angular/material";

import { Group } from '../house';

@Component({
  selector: 'app-group-status',
  templateUrl: './group-status.component.html',
  styleUrls: ['./group-status.component.css']
})
export class GroupStatusComponent implements OnInit {

  @Input() group: Group;

  @ViewChild(MatTooltip) tooltip;

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
  ) { }

  ngOnInit() {
  }

  showStatusText(evnt: any): void {
    evnt.stopPropagation();
    this.tooltip.show();
  }
}
