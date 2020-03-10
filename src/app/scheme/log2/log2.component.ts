import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { PageEvent } from '@angular/material/typings/paginator';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ISubscription } from "rxjs/Subscription";
import { Observable } from 'rxjs/Observable';
import { merge } from 'rxjs/observable/merge';
import { of as observableOf } from 'rxjs/observable/of';
import { catchError } from 'rxjs/operators/catchError';
import { map } from 'rxjs/operators/map';
import { startWith } from 'rxjs/operators/startWith';
import { switchMap } from 'rxjs/operators/switchMap';
import {TranslateService} from '@ngx-translate/core';
import {CookieService} from 'ngx-cookie-service';

import { Log_Value, Log_Event_Type } from "../scheme";
import { Scheme_Group_Member, PaginatorApi } from '../../user';
import { SchemeService } from "../scheme.service";
import { ControlService, WebSockCmd } from "../control.service";

import { VideoStreamDialogComponent } from "../dev-item-value/video-stream-dialog/video-stream-dialog.component";

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

  members: Scheme_Group_Member[] = [];

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  cmd = '';
  addArgs = '';
  search = '';
  pageEvent: any;

  constructor(
	  public translate: TranslateService,
    public dialog: MatDialog,
    private controlService: ControlService,
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
    const ipp = parseInt(this.cookie.get('log2ItemsPerPage'), 10);

    if (ipp !== NaN) {
      this.itemsPerPage = ipp;
      this.paginator.pageSize = this.itemsPerPage;
    } else {
      console.log('b');
      this.itemsPerPage = 35;
      this.paginator.pageSize = this.itemsPerPage;
    }

    const schemeId = this.schemeService.scheme.id;

    //this.schemeService.getMembers().subscribe(members => this.members = members.results);

    this.logDatabase = new LogHttpDao(this.http);

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.logDatabase!.getRepoIssues( schemeId,
            this.sort.active, this.sort.direction == 'asc', this.paginator.pageIndex, this.paginator.pageSize, this.addArgs, this.search);
        }),
        map(data => {
          //console.log(data);

          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.isRateLimitReached = false;
          this.resultsLength = data.count;

          for (const item of data.results as any) {
            item.isImg = item.raw_value && typeof item.raw_value === 'string' && item.raw_value.startsWith('img:');
            //console.log(item);
            item.date = new Date(item.timestamp_msecs);

            item.color = this.getColor(item.type_id);

            if (item.item) {
              if (item.item.group) {
                if (item.item.group.section) {
                  const sn = this.schemeService.scheme.section.find(s => s.id === item.item.group.section.id);
                  if (sn) {
                    item.item.group.section.name = sn.name;
                  }

                  const gn = sn.groups.find(g => g.id === item.item.group.id);
                  if (gn) {
                    item.item.group.title = gn.title;
                    item.item.group.type.title = gn.type.title;
                  }

                  const en = gn.items.find(i => i.id === item.item.id)
                  if (en) {
                    item.item.name = en.name;
                    item.item.type.title = en.type.title;
                  }

                  //console.log('1');
                }
              }
              //console.log(item);
            }

            //row.item.group.title || row.item.group.type.title
          }
          return data.results;
        }),
        catchError((err) => {
          console.error(err);
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
        console.warn('Log_Value without data');
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

  openImg(row: any): void {
    let dialogRef = this.dialog.open(VideoStreamDialogComponent, {
      width: '90%',
      data: { isImg: true, devItem: null, img: row }
    });

    dialogRef.afterClosed().subscribe(result => console.log(result));
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
    case Log_Event_Type.ET_DEBUG: return '#5A9740';
    case Log_Event_Type.ET_WARNING: return '#A39242';
    case Log_Event_Type.ET_CRITICAL: return '#994242';
    case Log_Event_Type.ET_INFO: return '#407D9E';
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

  getRepoIssues(schemeId: number, sort: string, order_asc: boolean, page: number, limit: number = 35, addArgs=null, search=null): Observable<PaginatorApi<Log_Value>> {
    // const requestUrl = `/api/v1/log_event/?limit=${limit}&offset=${page * limit}&ordering=${(order_asc ? '' : '-')}${sort || 'timestamp_msecs'}&id=${schemeId}`;
    let requestUrl = `/api/v1/log_value/?format=json&scheme_id=${schemeId}&limit=${limit}&offset=${page * limit}&ordering=${(order_asc ? '' : '-')}${sort || 'timestamp_msecs'}`

    if (search) {
      requestUrl += `&search=${search}`;
    }

    if (addArgs) {
      requestUrl += addArgs;
    }


    return this.http.get<PaginatorApi<Log_Value>>(requestUrl);
  }
}

