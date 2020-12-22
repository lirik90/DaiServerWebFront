import {Component, ComponentRef, Injectable, ViewContainerRef} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs';

export interface NeedSidebar {
    getSidebarWidget(viewContainerRef: ViewContainerRef): ComponentRef<any>;
}

export function needSidebarHelper(component: Component | (Component & NeedSidebar)): boolean {
    return 'getSidebarWidget' in component;
}

export interface SidebarAction<T> {
    type: string;
    data: T;
}

@Injectable()
export class SidebarService {
    private _sidebarEvents: BehaviorSubject<SidebarAction<any>> = new BehaviorSubject({
        type: 'init',
        data: null,
    });
    private _contentActions: BehaviorSubject<SidebarAction<any>> = new BehaviorSubject({
        type: 'init',
        data: null,
    });

    getSidebarActionBroadcast(): Observable<SidebarAction<any>> {
        return this._sidebarEvents.asObservable();
    }

    getContentActionBroadcast(): Observable<SidebarAction<any>> {
        return this._contentActions.asObservable();
    }

    performActionToContent<T>(action: SidebarAction<T>) {
        this._contentActions.next(action);
    }

    performActionToSidebar<T>(action: SidebarAction<T>) {
        this._sidebarEvents.next(action);
    }
}
