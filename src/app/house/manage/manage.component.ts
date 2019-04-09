import { Component, OnInit } from '@angular/core';
import { MatSnackBar, MatSlideToggleChange } from '@angular/material';

import { HouseService } from "../house.service";
import { Section, DeviceItem, EventLogType } from "../house";
import { ControlService } from "../control.service";

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['../../sections.css', './manage.component.css']
})
export class ManageComponent implements OnInit {
  houseName: string;
  sections: Section[];

  constructor(
    private houseService: HouseService,
    private controlService: ControlService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.getSections();
    /*
    this.controlService.other.subscribe(msg => {
      if (msg.cmd == "eventlog") {
        let event_type: string;
        switch(msg.data.type) {
          case EventLogType.DebugEvent: event_type = 'debug'; break;
          case EventLogType.WarningEvent: event_type = 'warning'; break;
          case EventLogType.CriticalEvent: event_type = 'critical'; break;
          case EventLogType.FatalEvent: event_type = 'fatal'; break;
          case EventLogType.InfoEvent: event_type = 'info'; break;
          case EventLogType.UserEvent: event_type = 'user'; break;
        }

        let panelClass: string[] = ['eventbar'];
        if (event_type)
          panelClass.push(panelClass[0] + '_' + event_type);

        this.snackBar.open(msg.data.text, /*'Don\'t show'* /'', {
          duration: 2000,
          panelClass: panelClass
        }).onAction().subscribe(() => {
          console.log('The snack-bar action was triggered!');
        });
      }
    });*/
  }

  getSections(): void {
    this.houseName = this.houseService.house.name;
    this.sections = this.houseService.house.sections;
  }
}
