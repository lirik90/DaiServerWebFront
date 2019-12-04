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
import { TeamMember, PaginatorApi } from '../../user';
import { HouseService } from "../house.service";
import { ControlService, WebSockCmd } from "../control.service";
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute} from '@angular/router';
import {CookieService} from 'ngx-cookie-service';
import {PageEvent} from '@angular/material/typings/paginator';

@Component({
  selector: 'app-log',
  templateUrl: './log2.component.html',
  styleUrls: ['./log2.component.css']
})
export class Log2Component implements OnInit, OnDestroy {
  displayedColumns = ['timestamp_msecs', 'section', 'group', 'element', 'value'];
  logDatabase: LogHttpDao | null;
  dataSource = new MatTableDataSource();

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  itemsPerPage;
  sub: ISubscription;

  members: TeamMember[] = [];

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  cmd = '';
  addArgs = '';
  search = '';
  pageEvent: any;

  constructor(
	  public translate: TranslateService,
    private controlService: ControlService,
    private houseService: HouseService,
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    public cookie: CookieService,
    ) {
      this.activatedRoute.queryParams.subscribe(params => {
        if (params['cmd']) {
          this.cmd = params['cmd'];
        }
      });
  }

  ngOnInit() {
    const ipp = parseInt(this.cookie.get('log2ItemsPerPage'), 10);

    if (ipp !== NaN) {
      this.itemsPerPage = ipp;
      this.paginator.pageSize = this.itemsPerPage;
    } else {
      console.log('b');
      this.itemsPerPage = 35;
      this.paginator.pageSize = this.itemsPerPage;
    }

    const houseId = this.houseService.house.id;

    //this.houseService.getMembers().subscribe(members => this.members = members.results);

    this.logDatabase = new LogHttpDao(this.http);

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.logDatabase!.getRepoIssues( houseId,
            this.sort.active, this.sort.direction == 'asc', this.paginator.pageIndex, this.paginator.pageSize, this.addArgs, this.search);
        }),
        map(data => {
          console.log(data);

          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.isRateLimitReached = false;
          this.resultsLength = data.count;

          for (let item of data.results) {
            console.log(item);
            item.date = new Date(item.timestamp_msecs);

            item.color = this.getColor(item.type_id);
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

    /*
    this.sub = this.controlService.byte_msg.subscribe(msg => {

      if (msg.cmd !== WebSockCmd.WS_EVENT_LOG)
        return;

      if (msg.data === undefined) {
        console.warn('EventLog without data');
        return;
      }

      if (!(this.paginator.pageIndex == 0 && this.sort.active == 'timestamp_msecs' && this.sort.direction == 'desc'))
        return;

      let rows = this.controlService.parseEventMessage(msg.data);
      for (let row of rows) {

        row.color = this.getColor(row.type_id);
        this.dataSource.data.pop(); // For table row count is stay setted
      }
      this.dataSource.data = [...rows, ...this.dataSource.data];
    });
     */
  }

  ngOnDestroy() {

  }

  dateFormat(cell: any): string {
    if (cell.clientWidth <= 60)
      return 'dd H:m';
    return 'dd.MM.yy HH:mm:ss';
    //console.log('hello ' + cell.clientWidth);
    //console.log(cell);
  }

  applyFilter(filterValue: string) {
    this.search = filterValue;
    this.ngOnInit();
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
    this.addArgs = script;
    this.ngOnInit();
  }

  handlePage($event: PageEvent) {
    console.log($event);
    const pi = $event.pageIndex;
    const ppi = $event.previousPageIndex;

    if (pi > ppi) {
      // scroll top
      window.scrollTo(0, 0);
    } else if (pi < ppi) {
      // scroll bottom
      window.scrollTo(0, document.body.scrollHeight);
    }

    if ($event.pageSize != this.itemsPerPage) {
      this.itemsPerPage = $event.pageSize;
      this.cookie.set('log2ItemsPerPage', String($event.pageSize), 365, '/');
    }
  }
}

/** An example database that the data source uses to retrieve data for the table. */
export class LogHttpDao {
  constructor(private http: HttpClient) {}

  getRepoIssues(houseId: number, sort: string, order_asc: boolean, page: number, limit: number = 35, addArgs=null, search=null): Observable<PaginatorApi<EventLog>> {
    // const requestUrl = `/api/v1/log_event/?limit=${limit}&offset=${page * limit}&ordering=${(order_asc ? '' : '-')}${sort || 'timestamp_msecs'}&id=${houseId}`;
    let requestUrl = `/api/v1/log_data_2/?format=json&id=${houseId}&limit=${limit}&offset=${page * limit}&ordering=${(order_asc ? '' : '-')}${sort || 'timestamp_msecs'}`

    if (search) {
      requestUrl += `&search=${search}`;
    }

    if (addArgs) {
      requestUrl += addArgs;
    }


    return this.http.get<PaginatorApi<EventLog>>(requestUrl);
  }
}

