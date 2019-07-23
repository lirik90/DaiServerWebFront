import {Component, Input, OnInit} from '@angular/core';
import {UIService} from '../../ui.service';
import {BreakpointState} from '@angular/cdk/layout';

@Component({
  selector: 'app-house-section',
  templateUrl: './house-section.component.html',
  styleUrls: ['./house-section.component.css']
})
export class HouseSectionComponent implements OnInit {
  @Input() title: string;

  isExpanded = false;

  constructor(private uiService: UIService) { }

  ngOnInit() {
    // TODO: Make something more convenient
    this.uiService.mobileBreakpointObserver().subscribe((state: BreakpointState) => {
      if (state.matches) {
        // desktop
        this.isExpanded = true;
      } else {
        // mobile
        this.isExpanded = false;
      }
    });
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }
}
