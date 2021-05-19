import {Component, ComponentFactoryResolver, ComponentRef, OnDestroy, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {PageEvent} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute} from '@angular/router';
import {CookieService} from 'ngx-cookie-service';
import {combineLatest, forkJoin, Observable, Subscription, SubscriptionLike} from 'rxjs';
import {map, tap} from 'rxjs/operators';

import {
    Device_Item,
    Device_Item_Group,
    DIG_Param,
    Log_Event,
    Log_Event_Type,
    Log_Mode,
    Log_Param,
    Log_Status,
    Log_Status_Direction,
    Log_Value, Section
} from '../scheme';
import {Scheme_Group_Member} from '../../user';
import {AuthenticationService} from '../../authentication.service';
import {SchemeService} from '../scheme.service';
import {ControlService, WebSockCmd} from '../control.service';
import {NeedSidebar, SidebarService} from '../sidebar.service';
import {
    DigLogFilter,
    LogFilter,
    LogsFilter,
    LogSidebarComponent,
    ParamsLogFilter,
    ValuesLogFilter
} from './log-sidebar/log-sidebar.component';

interface LogItem {
    type_id: string;
    user_id: number;
    text: string;
    time: number;

    color?: string;
    advanced_value?: string;
}

interface LogTableItem extends LogItem {
    color: string;
    bgColor: string;
}

@Component({
    selector: 'app-log',
    templateUrl: './log.component.html',
    styleUrls: ['./log.component.css']
})
export class LogComponent implements OnInit, OnDestroy, NeedSidebar {
    displayedColumns = ['user', 'timestamp_msecs', 'message'];
    logDatabase: LogHttpDao | null;
    dataSource = new MatTableDataSource();

    resultsLength = 0;
    isLoadingResults = true;
    isRateLimitReached = false;

    canExecScript: boolean;

    itemsPerPage;

    sub: SubscriptionLike;

    members: Scheme_Group_Member[] = [];

    @ViewChild(MatSort, {static: true}) sort: MatSort;

    cmd = '';
    pageEvent: any;
    private sidebarRef: ComponentRef<LogSidebarComponent>;
    private sidebarActionBroadcast$: Subscription;

    constructor(
        public translate: TranslateService,
        private controlService: ControlService,
        private authService: AuthenticationService,
        private schemeService: SchemeService,
        private http: HttpClient,
        private activatedRoute: ActivatedRoute,
        public cookie: CookieService,
        private resolver: ComponentFactoryResolver,
        private sidebarService: SidebarService,
    ) {
        this.activatedRoute.queryParams.subscribe(params => {
            if (params['cmd']) {
                this.cmd = params['cmd'];
            }
        });

        this.sidebarService.resetContent();
        this.sidebarActionBroadcast$ = this.sidebarService.getContentActionBroadcast()
            .subscribe((contentAction) => {
                this.updateFilter(contentAction.data);
            });
    }

    getSidebarWidget(viewContainerRef: ViewContainerRef): ComponentRef<LogSidebarComponent> {
        const factory = this.resolver.resolveComponentFactory(LogSidebarComponent);
        this.sidebarRef = viewContainerRef.createComponent(factory);
        return this.sidebarRef;
    }

    ngOnInit() {
        this.canExecScript = this.authService.checkPermission('exec_script');
        const schemeId = this.schemeService.scheme.id;

        this.schemeService.getMembers().subscribe(members => this.members = members.results);

        this.logDatabase = new LogHttpDao(this.http, this.schemeService);

        // merge(this.sort.sortChange, this.paginator.page)
        //     .pipe(
        //         startWith({}),
        //         switchMap(() => {
        //             this.isLoadingResults = true;
        //             return this.logDatabase!.getRepoIssues(schemeId,
        //                 this.sort.active, this.sort.direction == 'asc', this.paginator.pageIndex, this.paginator.pageSize);
        //         }),
        //         map(data => {
        //             // Flip flag to show that loading has finished.
        //             this.isLoadingResults = false;
        //             this.isRateLimitReached = false;
        //             this.resultsLength = data.count;
        //
        //             // console.log(JSON.stringify(data.results[0]));
        //             for (const item of data.results) {
        //                 //console.log(item);
        //                 item.date = new Date(item.timestamp_msecs);
        //
        //                 item.color = this.getColor(item.type_id);
        //             }
        //             return data.results;
        //         }),
        //         catchError(() => {
        //             this.isLoadingResults = false;
        //             // Catch if the GitHub API has reached its rate limit. Return empty data.
        //             this.isRateLimitReached = true;
        //             return of([]);
        //         })
        //     ).subscribe(data => this.dataSource.data = data); TODO:

        this.sub = this.controlService.byte_msg.subscribe(msg => {

            if (msg.cmd !== WebSockCmd.WS_EVENT_LOG) {
                return;
            }

            if (msg.data === undefined) {
                console.warn('Log_Event without data');
                return;
            }

            // if (!(this.paginator.pageIndex == 0 && this.sort.active == 'timestamp_msecs' && this.sort.direction == 'desc')) {
            //     return;
            // }

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
        this.sidebarActionBroadcast$.unsubscribe();
        this.sidebarService.resetSidebar();
        this.sidebarService.resetContent();
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
            case Log_Event_Type.ET_DEBUG:
                return '#5A9740';
            case Log_Event_Type.ET_WARNING:
                return '#A39242';
            case Log_Event_Type.ET_CRITICAL:
                return '#994242';
            case Log_Event_Type.ET_INFO:
                return '#407D9E';
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

    private updateFilter(data: LogsFilter) {
        const observables: Array<Observable<LogItem[]>> = [];
        const schemeId = this.schemeService.scheme.id;
        const logFilter: LogFilter = {
            ts_from: data.ts_from,
            ts_to: data.ts_to,
        };

        if (data.filter) {
            logFilter.filter = data.filter;
            logFilter.case_sensitive = data.case_sensitive;
        }

        if (data.selectedLogs.event) {
            observables.push(this.logDatabase.getEvents(schemeId, { ...logFilter }));
        }
        if (data.selectedLogs.mode) {
            observables.push(this.logDatabase.getModes(schemeId, {
                ...logFilter,
                dig_id: data.selectedGroupsId,
            }));
        }
        if (data.selectedLogs.param) {
            observables.push(this.logDatabase.getParams(schemeId, {
                ...logFilter,
                dig_param_id: data.selectedParamsId,
            }));
        }
        if (data.selectedLogs.status) {
            observables.push(this.logDatabase.getStatuses(schemeId, {
                ...logFilter,
                dig_id: data.selectedGroupsId,
            }));
        }
        if (data.selectedLogs.value) {
            observables.push(this.logDatabase.getValues(schemeId, {
                ...logFilter,
                item_id: data.selectedItemsId,
            }));
        }

        console.log(observables);
        combineLatest(observables.map((ob) => ob.pipe(tap(() => console.log('bs')))))
            .pipe(
                map(logEvents => logEvents.reduce((prev, curr) => prev.concat(curr))),
            )
            .subscribe((logEvents) => {
                console.log('1');
                this.dataSource.data = logEvents;
                this.isLoadingResults = false;
            });
    }
}

/** An example database that the data source uses to retrieve data for the table. */
export class LogHttpDao {
    constructor(private http: HttpClient, private schemeService: SchemeService) {
    }

    getEvents(schemeId: number, filter: LogFilter): Observable<LogItem[]> {
        return this.request<Log_Event>('event', schemeId, filter)
            .pipe(map((logEvents) => {
                return logEvents.map((logEvent) => ({
                    type_id: 'event',
                    text: `[${logEvent.category}] ${logEvent.text}`,
                    time: +logEvent.timestamp_msecs,
                    user_id: logEvent.user_id,
                }));
            }));
    }

    getModes(schemeId: number, filter: DigLogFilter): Observable<LogItem[]> {
        return this.request<Log_Mode>('mode', schemeId, filter)
            .pipe(
                map((logMode) => logMode.map(mode => ({
                    type_id: 'mode',
                    text: `[mode] ${this.get_dig_title(mode.group_id)} = ${this.get_mode_title(mode.mode_id)}`,
                    time: +mode.timestamp_msecs,
                    user_id: mode.user_id,
                }))),
            );
    }

    getStatuses(schemeId: number, filter: DigLogFilter): Observable<LogItem[]> {
        return this.request<Log_Status>('status', schemeId, filter)
            .pipe(
                map((logStatuses) => logStatuses.map((logStatus) => {
                    const { text, color } = this.getStatusText(logStatus);
                    return {
                        type_id: 'status',
                        user_id: logStatus.user_id,
                        time: +logStatus.timestamp_msecs,
                        text,
                        color,
                    };
                })),
            );
    }

    getParams(schemeId: number, filter: ParamsLogFilter): Observable<LogItem[]> {
        return this.request<Log_Param>('param', schemeId, filter)
            .pipe(
                map((logParams) => logParams.map(logParam => ({
                    type_id: 'param',
                    time: +logParam.timestamp_msecs,
                    text: `[param] ${this.get_dig_param_name(logParam.group_param_id)} = ${logParam.value}`,
                    user_id: logParam.user_id,
                }))),
            );
    }

    getValues(schemeId: number, filter: ValuesLogFilter): Observable<LogItem[]> {
        return this.request<Log_Value>('value', schemeId, filter)
            .pipe(
                map((logValues) => logValues.map((logValue) => {
                    const isBlob = LogHttpDao.is_blob(logValue.raw_value);
                    const devItemName = this.getDevItemName(logValue.item_id);

                    let text: string;
                    let advanced_value: string;

                    if (!isBlob) {
                        text = `${devItemName} ${logValue.value}`;
                        if (logValue.raw_value !== null) {
                            text += `(${logValue.raw_value})`;
                        }

                        advanced_value = null;
                    } else {
                        text = '';
                        advanced_value = logValue.raw_value;
                    }

                    return {
                        type_id: 'value',
                        user_id: logValue.user_id,
                        time: +logValue.timestamp_msecs,
                        text,
                        advanced_value,
                    };
                })),
            );
    }

    private request<T>(type: string, schemeId: number, filter: LogFilter): Observable<T[]> {
        const requestUrl = this.getUrl(type, schemeId, filter);
        return this.http.get<T[]>(requestUrl);
    }

    private getUrl(type: string, schemeId: number, filter: Object): string {
        let href = `/api/v2/scheme/${schemeId}/log/${type}/`;
        let isFirst = true;

        Object.keys(filter).forEach((key) => {
            const v = filter[key];
            if (isFirst) {
                href += `?${key}=${v}`;
                isFirst = false;
            } else {
                href += `&${key}=${v}`;
            }
        });

        return href;
    }

    private getDevItemName(item_id: number): string {
        let devItem: Device_Item;
        this.schemeService.scheme.device.find((dev) => {
            devItem = dev.items.find(item => item.id === item_id);
            return !!devItem;
        });

        if (!devItem) {
            throw new Error(`Device Item ${item_id} not found`);
        }

        const digTitle = this.get_dig_title(devItem.group_id);
        return `${digTitle}->${devItem.name || devItem.type.title}`;
    }

    private get_dig_param_name(param_id: number): string {
        let group: Device_Item_Group;
        let paramPath: DIG_Param[];

        const section = this.schemeService.scheme.section
            .find((section) => {
                group = section.groups.find((g): boolean => {
                    paramPath = this.recursiveSearchParamNames(g.params, param_id);
                    return !!paramPath;
                });

                return !!group;
            });

        if (!group || !paramPath) {
            throw new Error(`Param ${param_id} not found`);
        }
        let paramPathString = paramPath.map((param) => param.param.title).join('->');
        paramPathString = `${this.groupTitle(section, group)}->${paramPathString}`;

        return paramPathString;
    }

    private recursiveSearchParamNames(params: DIG_Param[], param_id: number): DIG_Param[] {
        let param = params.find(para => para.id === param_id);
        if (!param) {
            let paramPath: DIG_Param[];
            const parentParam = params.find((para) => {
                paramPath = this.recursiveSearchParamNames(para.childs, param_id);
                return !!paramPath;
            });
            if (paramPath) {
                return [parentParam, ...paramPath];
            }
        }

        return [param] || [];
    }

    private get_dig_title(group_id: number) {
        let group: Device_Item_Group;
        const section = this.schemeService.scheme.section
            .find((sect) => {
                group = sect.groups.find(gr => gr.id === group_id);
                return !!group;
            });

        if (!group || !section) {
            throw new Error(`Group ${group_id} not foound`);
        }

        return this.groupTitle(section, group);
    }

    private get_mode_title(mode_id: number) {
        const mode = this.schemeService.scheme.dig_mode_type.find(m => m.id === mode_id);
        return mode.title;
    }

    private getStatusText(logStatus: Log_Status): { color: string, text: string } {
        const status = this.schemeService.scheme.dig_status_type.find(status => status.id === logStatus.status_id);
        const digTitle = this.get_dig_title(logStatus.group_id);

        let direction: string;
        let color = null;
        let emoji: string;
        if (logStatus.direction === Log_Status_Direction.SD_DEL) {
            direction = '-';
            emoji = '🆙 ';
        } else {
            const category = this.schemeService.scheme.dig_status_category.find(cat => cat.id === status.category_id);
            emoji = LogHttpDao.getEmoji(category.name);
            color = LogHttpDao.getStatusTextColor(category.name);
        }

        const formattedStatusText = LogHttpDao.formatStatusText(status.text, logStatus.args);
        const text = `${digTitle} ${direction} ${emoji} ${emoji} ${formattedStatusText}`;

        return { text, color };
    }

    private static formatStatusText(text, args): string {
        if (args !== null)
        {
            const args_list = args.split(',');
            args_list.forEach((arg, idx) => {
                text = text.replaceAll("%" + (idx + 1), arg);
            });
        }
        return text;
    }

    private static getEmoji(categoryName: string): string {
        let emoji: string;
        switch (categoryName) {
            case 'Error':
                emoji = '🚨 ';
                break;
            case 'Warn':
                emoji = '⚠️ ';
                break;
            case 'Ok':
                emoji = '✅ ';
                break;
            default:
                emoji = '';
        }

        return emoji;
    }

    private static getStatusTextColor(name: string): string {
        let color: string;
        switch (name) {
            case 'Error':
                color = '#994242';
                break;
            case 'Warn':
                color = '#A39242';
                break;
            case 'Ok':
                color = '#5A9740';
                break;
            default:
                color = null;
        }

        return color;
    }

    private groupTitle(section: Section, group: Device_Item_Group): string {
        let group_title = group.title || group.type.title;
        if (this.schemeService.scheme.section.length > 0) {
            group_title = `${section.name}->${group_title}`;
        }

        return group_title;
    }

    private static is_blob(raw: any) {
        return raw && typeof raw === 'string' && raw.startsWith('img:');
    }
}

