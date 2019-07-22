import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import { MatSnackBar, MatSlideToggleChange } from '@angular/material';

import { HouseService } from "../house.service";
import { Section, DeviceItem, EventLogType, Group, GroupMode } from "../house";
import { ControlService } from "../control.service";

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['../../sections.css', './manage.component.css']
})
export class ManageComponent implements OnInit {
  houseName: string;
  sections: Section[] = [];
  groupModes: GroupMode[];

  is_view: boolean;

  constructor(
    private route: ActivatedRoute,
    private houseService: HouseService,
    private controlService: ControlService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    router.events.subscribe(s => {
      if (s instanceof NavigationEnd) {
        const tree = router.parseUrl(router.url);
        if (tree.fragment) {
          const element = document.querySelector("#" + tree.fragment);
          if (element) {
            element.scrollIntoView({block: 'start', behavior: 'smooth'});
          }
        }
      }
    });
  }

  ngOnInit() {
    this.houseName = this.houseService.house.name;
    this.groupModes = this.houseService.house.groupModes;

    this.is_view = this.route.snapshot.data['is_view'];
    if (this.is_view)
    {
      this.route.params.subscribe(params => {
        const view_id = params['view_id'];
        this.get_view_item(view_id);
      });
    }
    else
    {
      this.sections = this.houseService.house.sections;
    }

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

  get_view_item(view_id: number): void
  {
    this.sections = [];
    this.houseService.getViewItems(view_id).subscribe(api =>
    {
      for (const sct of this.houseService.house.sections)
      {
        for (const group of sct.groups)
        {
          for (const dev_item of group.items)
          {
            for (let i in api.results)
            {
              const view_item = api.results[i];
              if (view_item.item_id == dev_item.id)
              {
                this.add_device_item(sct, group, dev_item);
                api.results.splice(parseInt(i), 1);
                break;
              }
            }
          }
        }
      }
    });
  }

  add_device_item(sct: Section, grp: Group, dev_item: DeviceItem): void
  {
    let section: Section = undefined;
    for (const sct_item of this.sections)
    {
      if (sct_item.id == sct.id)
      {
        section = sct_item;
        break;
      }
    }

    if (!section)
    {
      section = Object.assign({}, sct);
      section.groups = [];
      this.sections.push(section);
    }

    let group: Group = undefined;
    for (const grp_item of section.groups)
    {
      if (grp_item.id == grp.id)
      {
        group = grp_item;
        break;
      }
    }

    if (!group)
    {
      group = Object.assign({}, grp);
      group.items = [];
      section.groups.push(group);
    }

    group.items.push(dev_item);
  }
}
