import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-label-element-text',
  templateUrl: './label-element-text.component.html',
  styleUrls: ['./label-element-text.component.css']
})
export class LabelElementTextComponent implements OnInit {
  @Input() text: any;

  constructor() { }

  ngOnInit() {  }
}
