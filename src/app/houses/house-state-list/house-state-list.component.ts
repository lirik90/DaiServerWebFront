import {Component, Input, OnChanges, OnInit} from '@angular/core';

@Component({
  selector: 'app-house-state-list',
  templateUrl: './house-state-list.component.html',
  styleUrls: ['./house-state-list.component.css']
})
export class HouseStateListComponent implements OnInit, OnChanges {

  status_weight = {
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4
  };

  status_class = {
    '1': 'ok',
    '2': 'undef',
    '3': 'warn',
    '4': 'err'
  };

  isModalOpen = false;

  most_bad_status: number;

  @Input() messages: any;

  constructor(
  ) { }

  ngOnInit() {
    this.update();
  }

  ngOnChanges(){
    this.update();
  }

  update() {
    if (!this.messages) {
      this.messages = [];
    }

    this.most_bad_status = 1;

    for (const st of this.messages) {
      const stweight =  this.status_weight[st.status];
      if (stweight > this.most_bad_status) {
        this.most_bad_status = stweight;
      }
    }
  }

  toggleModal() {
    this.isModalOpen = !this.isModalOpen;
  }

  closeModal() {
    this.isModalOpen = false;
  }

}
