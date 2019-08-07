import {Component, ElementRef, OnInit, TemplateRef, ViewChild, ViewEncapsulation} from '@angular/core';



@Component({
  selector: 'app-label-configurator',
  templateUrl: './label-configurator.component.html',
  styleUrls: ['./label-configurator.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class LabelConfiguratorComponent implements OnInit {
  taps = [1, 2];

  fields = {
    text: 'some text'
  };

  constructor() { }

  ngOnInit() { }
}
