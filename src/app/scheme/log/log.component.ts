import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ISubscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { merge } from 'rxjs/observable/merge';
import { of as observableOf } from 'rxjs/observable/of';
import { catchError } from 'rxjs/operators/catchError';
import { map } from 'rxjs/operators/map';
import { startWith } from 'rxjs/operators/startWith';
import { switchMap } from 'rxjs/operators/switchMap';

import { Log_Event, Log_Event_Type } from '../scheme';
import { Scheme_Group_Member, PaginatorApi } from '../../user';
import { AuthenticationService } from '../../authentication.service';
import { SchemeService } from '../scheme.service';
import { ControlService, WebSockCmd } from '../control.service';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.css']
})
export class LogComponent implements OnInit, OnDestroy {
  displayedColumns = ['user', 'timestamp_msecs', 'category', 'message'];
  logDatabase: LogHttpDao | null;
  dataSource = new MatTableDataSource();

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  canExecScript: boolean;

  itemsPerPage;

  sub: ISubscription;

  members: Scheme_Group_Member[] = [];

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  cmd = '';
  pageEvent: any;

  constructor(
    public translate: TranslateService,
    private controlService: ControlService,
    private authService: AuthenticationService,
    private schemeService: SchemeService,
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
    this.canExecScript = this.authService.checkPermission('exec_script');

    const ipp = parseInt(this.cookie.get('logItemsPerPage'), 10);

    if (ipp !== NaN) {
      this.itemsPerPage = ipp;
      this.paginator.pageSize = this.itemsPerPage;
    } else {
      console.log('b');
      this.itemsPerPage = 35;
      this.paginator.pageSize = this.itemsPerPage;
    }

    const schemeId = this.schemeService.scheme.id;

    this.schemeService.getMembers().subscribe(members => this.members = members.results);

    this.logDatabase = new LogHttpDao(this.http);


    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.logDatabase!.getRepoIssues( schemeId,
            this.sort.active, this.sort.direction == 'asc', this.paginator.pageIndex, this.paginator.pageSize);
        }),
        map(data => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.isRateLimitReached = false;
          this.resultsLength = data.count;

          // console.log(JSON.stringify(data.results[0]));
          for (const item of data.results) {
            //console.log(item);
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

    this.sub = this.controlService.byte_msg.subscribe(msg => {

      if (msg.cmd !== WebSockCmd.WS_EVENT_LOG) {
        return;
      }

      if (msg.data === undefined) {
        console.warn('Log_Event without data');
        return;
      }

      if (!(this.paginator.pageIndex == 0 && this.sort.active == 'timestamp_msecs' && this.sort.direction == 'desc')) {
        return;
      }

      const rows = this.controlService.parseEventMessage(msg.data);
      for (const row of rows) {

        row.color = this.getColor(row.type_id);
        this.dataSource.data.pop(); // For table row count is stay setted
      }
      this.dataSource.data = [...rows, ...this.dataSource.data];
    });
  }

  getUserName(id: number): string {
    if (id === null || id === 0) {
      return '';
    }
    for (const user of this.members) {
      if (user.id === id) {
        return user.name;
    }
      }
    return this.translate.instant('LOG.UNKNOWN_USER') + ' ' + String(id);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  dateFormat(cell: any): string {
    if (cell.clientWidth <= 60) {
      return 'dd H:m';
    }
    return 'dd.MM.yy HH:mm:ss';
    // console.log('hello ' + cell.clientWidth);
    // console.log(cell);
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  getColor(eventType: number): string {
    switch (eventType) {
    case Log_Event_Type.ET_DEBUG: return '#5A9740';
    case Log_Event_Type.ET_WARNING: return '#A39242';
    case Log_Event_Type.ET_CRITICAL: return '#994242';
    case Log_Event_Type.ET_INFO: return '#407D9E';
    }
    return 'black';
  }

  execScript(script: string): void {
    this.controlService.execScript(script);
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
      this.cookie.set('logItemsPerPage', String($event.pageSize), 365, '/');
    }
  }
}

/** An example database that the data source uses to retrieve data for the table. */
export class LogHttpDao {
  constructor(private http: HttpClient) {}

  getRepoIssues(schemeId: number, sort: string, order_asc: boolean, page: number, limit: number = 35): Observable<PaginatorApi<Log_Event>> {
    const requestUrl = `/api/v1/log_event/?limit=${limit}&offset=${page * limit}&ordering=${(order_asc ? '' : '-')}${sort || 'timestamp_msecs'}&scheme_id=${schemeId}`;
    return this.http.get<PaginatorApi<Log_Event>>(requestUrl);
  }
}

