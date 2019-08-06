import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-label-configurator',
  templateUrl: './label-configurator.component.html',
  styleUrls: ['./label-configurator.component.css']
})
export class LabelConfiguratorComponent implements OnInit {

  @ViewChild('canvas')
  canvas: ElementRef<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D;

  constructor() { }

  ngOnInit() {
    this.ctx = this.canvas.nativeElement.getContext('2d');

    this.draw();
  }

  draw() {
    this.ctx.fillStyle = 'red';
    this.ctx.fillRect(0, 0, 50, 50);
  }

}
