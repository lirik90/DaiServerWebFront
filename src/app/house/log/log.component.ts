import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ISubscription } from "rxjs/Subscription";
import { Observable } from 'rxjs/Observable';
import { merge } from 'rxjs/observable/merge';
import { of as observableOf } from 'rxjs/observable/of';
import { catchError } from 'rxjs/operators/catchError';
import { map } from 'rxjs/operators/map';
import { startWith } from 'rxjs/operators/startWith';
import { switchMap } from 'rxjs/operators/switchMap';

import { EventLog, EventLogType } from "../house";
import { PaginatorApi } from '../../user';
import { HouseService } from "../house.service";
import { ControlService, Cmd } from "../control.service";

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.css']
})
export class LogComponent implements OnInit, OnDestroy {
  displayedColumns = ['date', 'category', 'message'];
  logDatabase: LogHttpDao | null;
  dataSource = new MatTableDataSource();

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  sub: ISubscription;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private controlService: ControlService,
    private houseService: HouseService,
    private http: HttpClient) {}

  ngOnInit() {
    const houseId = this.houseService.house.id;

    this.logDatabase = new LogHttpDao(this.http);

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.logDatabase!.getRepoIssues( houseId,
            this.sort.active, this.sort.direction == 'asc', this.paginator.pageIndex, this.paginator.pageSize);
        }),
        map(data => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.isRateLimitReached = false;
          this.resultsLength = data.count;

          console.log(JSON.stringify(data.results[0]));
          for (let item of data.results) {
            item.color = this.getColor(item.type);
          }
          return data.results;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          // Catch if the GitHub API has reached its rate limit. Return empty data.
          this.isRateLimitReached = true;
          return observableOf([]);
        })
      ).subscribe(data => this.dataSource.data = data);

    this.sub = this.controlService.byte_msg.subscribe(msg => {
      if (msg.cmd != Cmd.Eventlog)
        return;
      
      if (msg.data === undefined) {
        console.warn('EventLog without data');
        return;
      }

      if (!(this.paginator.pageIndex == 0 && this.sort.active == 'date' && this.sort.direction == 'desc'))
        return;

      let row = this.controlService.parseEventMessage(msg.data);
      row.color = this.getColor(row.type);
      this.dataSource.data.pop();
      this.dataSource.data = [row, ...this.dataSource.data];
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  dateFormat(cell: any): string {
    if (cell.clientWidth <= 60)
      return 'dd H:m';
    return 'dd.MM.yy HH:mm:ss';
    //console.log('hello ' + cell.clientWidth);
    //console.log(cell);
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  getColor(eventType: number): string {
    switch (eventType) {
    case EventLogType.DebugEvent: return '#5A9740';
    case EventLogType.WarningEvent: return '#A39242';
    case EventLogType.CriticalEvent: return '#994242';
    case EventLogType.InfoEvent: return '#407D9E';
    }
    return 'black';
  }

  execScript(script: string): void {
    this.controlService.execScript(script);
  }
}

/** An example database that the data source uses to retrieve data for the table. */
export class LogHttpDao {
  constructor(private http: HttpClient) {}

  getRepoIssues(houseId: number, sort: string, order_asc: boolean, page: number, limit: number = 35): Observable<PaginatorApi<EventLog>> {
    const requestUrl = `/api/v1/events/?limit=${limit}&offset=${page * limit}&ordering=${(order_asc ? '' : '-')}${sort || 'id'}&id=${houseId}`;
    return this.http.get<PaginatorApi<EventLog>>(requestUrl);
  }
}

