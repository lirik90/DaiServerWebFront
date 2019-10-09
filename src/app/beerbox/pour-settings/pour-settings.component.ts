import { Component, OnInit } from '@angular/core';
import {filter} from 'rxjs/operators';
import {ParamsDialogComponent} from '../../house/manage/manage.component';
import {MatDialog} from '@angular/material';
import {HouseService} from '../../house/house.service';

@Component({
  selector: 'app-pour-settings',
  templateUrl: './pour-settings.component.html',
  styleUrls: ['./pour-settings.component.css']
})
export class PourSettingsComponent implements OnInit {
  taps: any[];

  constructor(
    public dialog: MatDialog,
    private houseService: HouseService,
  ) { }

  ngOnInit() {
    this.taps = [];

    this.houseService.house.sections.map((sec, i) => {
      if (i !== 0) {
        const group = sec.groups.find(g => g.type.name === 'params');
        this.taps.push({name: sec.name, paramsGroupId: group.id, grp: group});
      }
    });
  }

  openParamsDialog(groupId) {
    this.dialog.open(ParamsDialogComponent, {width: '80%', data: { groupId: groupId }})
      .afterClosed().pipe(
      filter(name => name)
    ).subscribe(res => {
    });
  }
}
