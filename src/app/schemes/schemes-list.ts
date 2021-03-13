import {Observable, Subject, Subscription} from 'rxjs';
import {Connection_State, Scheme} from '../user';
import {takeUntil} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {TranslateService} from '@ngx-translate/core';
import {Component, Injectable, OnDestroy} from '@angular/core';

export class StatusItems {
    connection: number;
    items: {
        args: any;
        group_id: number;
        id: number;
        status_id: number;
        title: string;
    }[];
}

export class StatusInfo {
    groupType_id: number;
    id: number;
    inform: boolean;
    name: string;
    text: string;
    category_id: number;
}

@Injectable()
export abstract class SchemesList implements OnDestroy {
    public schemes: Scheme[] = [];

    private statusInfo = {};
    private statusQueue = {};
    protected statusItemSubs: Subscription[] = [];

    private httpReqs: Subject<void> = new Subject<void>();

    protected constructor(private http: HttpClient, private translate: TranslateService) {
    }

    ngOnDestroy(): void {
        // This aborts all HTTP requests.
        this.httpReqs.next();
        // This completes the subject properlly.
        this.httpReqs.complete();
    }

    private httpGet<T>(req: string): Observable<T> {
        return this.http.get<T>(req)
            .pipe( takeUntil(this.httpReqs) );
    }

    protected getStatuses(schemes: Scheme[] = this.schemes) {
        schemes.map(h => {
            const id = h.parent || h.id;

            h.mod_state = false;
            h.loses_state = false;
            h.status_checked = false;
            h.connect_state = Connection_State.CS_SERVER_DOWN;

            // get status
            const sub = this.httpGet<StatusItems>(`/api/v2/scheme/${h.id}/dig_status`).subscribe(statusItems => {
                h.messages = []; // 0 messages, wait

                // set connection status
                h.connection = statusItems.connection;
                const [connState, modState, losesState] = SchemesList.parseConnectNumber(h.connection);
                h.mod_state = <boolean>modState;
                h.loses_state = <boolean>losesState;
                h.status_checked = true;
                h.connect_state = <Connection_State>connState;

                // set messages
                if (this.statusInfo[id]) { // if we have StatusInfo
                    // do it now
                    this.putMessages(h.id, statusItems, this.statusInfo[id]);
                } else { // if we haven't StatusInfo
                    // put into queue
                    if (!this.statusQueue[id]) {
                        this.statusQueue[id] = {isLoading: false, depSchemes: []}; // create a place in queue
                    }
                    this.statusQueue[id].depSchemes.push({id: h.id, si: statusItems}); // put scheme as a depeneded

                    if (!this.statusQueue[id].isLoading) {
                        // start loading if was not started
                        this.statusQueue[id].isLoading = true;
                        this.getStatusInfo(id, h.id);
                    }
                }

                sub.unsubscribe();
            });

            this.statusItemSubs.push(sub);
        });
    }

    private getStatusInfo(id: number, real_id: number) {
        const statusInfoSubs = this.http.get<any[]>(`/api/v2/scheme/${real_id}/dig_status_type`).subscribe(statusInfo => {
            this.statusInfo[id] = statusInfo;

            /*
            console.log(`${id} is loaded`);
            console.log(statusInfo);
             */

            if (this.statusQueue[id]) {
                // parse a queue

                this.statusQueue[id].depSchemes.forEach((dh) => {
                    this.putMessages(dh.id, dh.si, statusInfo);
                });
            }

            statusInfoSubs.unsubscribe();
        });
    }

    private putMessages(id: number, statusItems: StatusItems, st: StatusInfo[]) {
        const scheme = this.schemes.find(h => h.id === id);

        for (let i = 0; i < statusItems.items.length; i++) {
            const si = statusItems.items[i];

            const st_item = st.find(sti => sti.id === si.status_id);
            if (st_item) {
                scheme.messages.push({status: st_item.category_id, text: st_item.text, where: si.title});
            }
        }
    }

    private static parseConnectNumber(n: number) {
        // tslint:disable:no-bitwise
        const connState = n & ~Connection_State.CS_CONNECTED_MODIFIED & ~Connection_State.CS_CONNECTED_WITH_LOSSES;
        const modState = (n & Connection_State.CS_CONNECTED_MODIFIED) === Connection_State.CS_CONNECTED_MODIFIED;
        const losesState = (n & Connection_State.CS_CONNECTED_WITH_LOSSES) === Connection_State.CS_CONNECTED_WITH_LOSSES;
        // tslint:enable:no-bitwise

        return [connState, modState, losesState];
    }

    public status_desc(h): string {
        if (h.connection_str !== undefined && h.connection_str !== ' ') {
            return h.connection_str;
        }

        let result = '';

        if (h.mod_state) {
            result += this.translate.instant('MODIFIED') + '. ';
        }


        if (h.loses_state) {
            result += 'С потерями пакетов. ';
        }

        if (h.status_checked) {
            switch (h.connect_state) {
                case Connection_State.CS_SERVER_DOWN:
                    return this.translate.instant('SERVER_DOWN');
                case Connection_State.CS_DISCONNECTED:
                    return result + this.translate.instant('OFFLINE');
                case Connection_State.CS_CONNECTED:
                    return result + this.translate.instant('ONLINE');
                case Connection_State.CS_CONNECTED_MODIFIED:
                    return result + this.translate.instant('MODIFIED');
                case Connection_State.CS_DISCONNECTED_JUST_NOW:
                    return result + this.translate.instant('DISCONNECTED_JUST_NOW');
                case Connection_State.CS_CONNECTED_JUST_NOW:
                    return result + this.translate.instant('CONNECTED_JUST_NOW');
                case Connection_State.CS_CONNECTED_SYNC_TIMEOUT:
                    return result + this.translate.instant('CONNECTED_SYNC_TIMEOUT');
            }
        }
        return this.translate.instant('WAIT') + '...';
    }

    public status_class(h): string { // TODO: remove this duplicate
        if (h.connection_str !== undefined && h.connection_str !== ' ') {
            return 'status_fail';
        }

        if (!h.status_checked) {
            return 'status_check';
        }

        if (h.mod_state) {
            return 'status_modified';
        }

        switch (h.connect_state) {
            case Connection_State.CS_SERVER_DOWN:
                return 'status_server_down';
            case Connection_State.CS_DISCONNECTED:
                return 'status_bad';
            case Connection_State.CS_CONNECTED_SYNC_TIMEOUT:
            //  return 'status_sync_fail';
            case Connection_State.CS_CONNECTED:
                return 'status_ok';
            case Connection_State.CS_CONNECTED_MODIFIED:
                return 'status_modified';
            case Connection_State.CS_DISCONNECTED_JUST_NOW:
                return 'status_bad_just';
            case Connection_State.CS_CONNECTED_JUST_NOW:
                return 'status_sync';
        }
    }
}
