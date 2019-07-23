import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import { MatSnackBar } from '@angular/material';

import { HouseService } from '../house.service';
import { Section, DeviceItem, Group, GroupMode } from '../house';
import { ControlService } from '../control.service';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['../../sections.css', './manage.component.css']
})
export class ManageComponent implements OnInit, AfterViewInit {
  houseName: string;
  sections: Section[] = [];
  groupModes: GroupMode[];

  is_view: boolean;

  currentSection: number;
  currentGroup: number;

  constructor(
    private route: ActivatedRoute,
    private houseService: HouseService,
    private controlService: ControlService,
    private router: Router
  ) {
    router.events.subscribe(s => {
      if (s instanceof NavigationEnd) {
        const tree = router.parseUrl(router.url);
        if (tree.fragment) {
          const parsed = tree.fragment.match(/^section-(\d+)-group-(\d+)$/);
          if (parsed) {
            this.currentSection = parseInt(parsed[1], 10);
            this.currentGroup = parseInt(parsed[2], 10);

            this.scrollToGroup(this.currentGroup);
          }
        }
      }
    });
  }

  ngOnInit() {
    this.houseName = this.houseService.house.name;
    this.groupModes = this.houseService.house.groupModes;

    this.is_view = this.route.snapshot.data['is_view'];
    if (this.is_view) {
      this.route.params.subscribe(params => {
        const view_id = params['view_id'];
        this.get_view_item(view_id);
      });
    } else {
      this.sections = this.houseService.house.sections;
    }
  }

  ngAfterViewInit(): void {
    this.scrollToGroup(this.currentGroup);
  }

  scrollToGroup(group_id: number) {
    const el = document.querySelector('#house-group-' + group_id);

    if (el) {
      setTimeout(() => {
        el.scrollIntoView({block: 'start', inline: 'center', behavior: 'smooth'});
      }, 200);
    }
  }

  get_view_item(view_id: number): void {
    this.sections = [];
    this.houseService.getViewItems(view_id).subscribe(api => {
      for (const sct of this.houseService.house.sections) {
        for (const group of sct.groups) {
          for (const dev_item of group.items) {
            for (const i in api.results) {
              const view_item = api.results[i];
              if (view_item.item_id === dev_item.id) {
                this.add_device_item(sct, group, dev_item);
                api.results.splice(parseInt(i, 10), 1);
                break;
              }
            }
          }
        }
      }
    });
  }

  add_device_item(sct: Section, grp: Group, dev_item: DeviceItem): void {
    let section: Section;
    for (const sct_item of this.sections) {
      if (sct_item.id === sct.id) {
        section = sct_item;
        break;
      }
    }

    if (!section) {
      section = Object.assign({}, sct);
      section.groups = [];
      this.sections.push(section);
    }

    let group: Group;
    for (const grp_item of section.groups) {
      if (grp_item.id === grp.id) {
        group = grp_item;
        break;
      }
    }

    if (!group) {
      group = Object.assign({}, grp);
      group.items = [];
      section.groups.push(group);
    }

    group.items.push(dev_item);
  }
}
