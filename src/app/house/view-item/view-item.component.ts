import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

import { HouseService } from "../house.service";
import { Section, Group, ViewItem, DeviceItem } from "../house";

@Component({
  selector: 'app-view-item',
  templateUrl: './view-item.component.html',
  styleUrls: ['../../sections.css', './view-item.component.css']
})
export class ViewItemComponent implements OnInit {
  houseName: string;
  sections: Section[] = [];

  constructor(
    private route: ActivatedRoute,
    private houseService: HouseService
  ) { }

  ngOnInit() {
    this.houseName = this.houseService.house.name;

    this.route.params.subscribe(params => {
      const view_id = params['view_id'];
      this.get_view_item(view_id);
    });
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
