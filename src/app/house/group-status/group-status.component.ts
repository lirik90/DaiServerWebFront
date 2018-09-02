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

  status_name: string;
  text: string;
  short_text: string;

  constructor(
  ) { }

  ngOnInit() {
    this.setStatus(1);
  }

  setStatus(status_code: number): void {
    let postfix: string;
    switch(status_code) {
    case 1:
      this.status_name = 'success';
      this.short_text = 'Ok';
      postfix = 'is ok!';
      break;
    default:
      this.status_name = 'unknown';
      this.short_text = '?';
      postfix = 'is unknown.';
      break;
    }

    this.text = this.group.type.name + ' ' + postfix;
  }

  showStatusText(evnt: any): void {
    evnt.stopPropagation();
    this.tooltip.show();
  }
}
