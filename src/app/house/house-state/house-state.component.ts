/**
 * Отображает текущий статус бирбокса
 */
import {Component, Input, OnInit} from '@angular/core';
import {HouseService} from '../house.service';
import {UIService} from '../../ui.service';

@Component({
  selector: 'app-house-state',
  templateUrl: './house-state.component.html',
  styleUrls: ['./house-state.component.css']
})
export class HouseStateComponent implements OnInit {

  @Input() top: number;

  status_weight = {
    'Ok': 0,
    'Undefined': 1,
    'Warn': 2,
    'Error': 3
  };

  status_class = {
    'Ok': 'ok',
    'Undefined': 'undef',
    'Warn': 'warn',
    'Error': 'err'
  };

  isModalOpen = false;

  constructor(
    public houseService: HouseService,
    public uiService: UIService,
  ) { }

  ngOnInit() {
  }

  toggleModal() {
    this.isModalOpen = !this.isModalOpen;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  openModal() {
    this.isModalOpen = false;
  }

  get state() {
    const msgArray = [];

    let most_bad_status = 'Ok';

    for (const sect of this.houseService.house.sections) {
      for (const grp of sect.groups) {
        let status = 'Undefined',
            status_text = '';

        if (grp.status_info !== undefined) {
          status = grp.status_info.short_text;
          status_text = grp.status_info.text;
        }

        if (status === 'Ok') {
          continue;
        }

        if (this.status_weight[status] > this.status_weight[most_bad_status]) {
          most_bad_status = status;
        }

        msgArray.push({
          section: sect.name,
          section_id: sect.id,
          group: grp.title ? grp.title : grp.type.title, // TODO: Why there are 'title' and 'type.title'?
          group_id: grp.id,
          status: status,
          text: status_text,
        });
      }
    }


    return { messagesCount: msgArray.length, most_bad_status: most_bad_status, messages: msgArray};
  }
}
