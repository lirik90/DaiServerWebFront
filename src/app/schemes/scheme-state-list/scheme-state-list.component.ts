import {Component, Input, OnChanges, OnInit} from '@angular/core';

@Component({
  selector: 'app-scheme-state-list',
  templateUrl: './scheme-state-list.component.html',
  styleUrls: ['./scheme-state-list.component.css']
})
export class SchemeStateListComponent implements OnInit, OnChanges {

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

  get most_bad_status() {
    const mbs = this.messages.reduce((acc, cur) => acc = cur.status > acc ? cur.status : acc, [1]);

    //console.log(mbs);
    return mbs;
  }

  @Input() messages: any;

  constructor(
  ) { }

  ngOnInit() {
    this.update();
  }

  ngOnChanges() {
    this.update();
  }

  update() {
    if (!this.messages) {
      this.messages = [];
    }
/*
    console.log(this.messages);

    this.most_bad_status = 1;

    for (const st of this.messages) {
      const stweight =  this.status_weight[st.status];

      if (stweight > this.most_bad_status) {
        this.most_bad_status = stweight;
      }
    }
    */
  }

  toggleModal() {
    this.isModalOpen = !this.isModalOpen;
  }

  closeModal() {
    this.isModalOpen = false;
  }

}
