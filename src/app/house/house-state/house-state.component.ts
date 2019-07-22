/**
 * Отображает текущий статус бирбокса
 */
import {Component, Input, OnInit} from '@angular/core';
import {HouseService} from '../house.service';

@Component({
  selector: 'app-house-state',
  templateUrl: './house-state.component.html',
  styleUrls: ['./house-state.component.css']
})
export class HouseStateComponent implements OnInit {

  constructor(
    public houseService: HouseService,
  ) { }

  ngOnInit() {
  }

  get messages() {
    const msgArray = [];

    for (const sect of this.houseService.house.sections) {
      for (const grp of sect.groups) {
        let status = 'undefined',
            status_text = '';

        if (grp.status_info !== undefined) {
          status = grp.status_info.short_text;
          status_text = grp.status_info.text;
        }

        if (status === 'Ok') {
          continue;
        }

        msgArray.push({
          section: sect.name,
          group: grp.title ? grp.title : grp.type.title, // TODO: Why there are 'title' and 'type.title'?
          group_id: grp.id,
          status: status,
          text: status_text,
        });
      }
    }


    return msgArray;
  }
}
