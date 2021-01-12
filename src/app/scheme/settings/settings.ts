import {WebSockCmd} from '../control.service';
import {ByteTools, WebSocketBytesService} from '../../web-socket.service';
import {SchemeService} from '../scheme.service';

export enum StructType {
  Unknown,
  Devices,
  PluginType,
  DeviceItems,
  DeviceItemTypes,
  SaveTimers,
  Sections,
  Groups,
  GroupTypes,
  GroupModeTypes,
  GroupParamTypes,
  GroupStatusInfo,
  DIG_STATUS_CATEGORY,
  Group_Param,
  Signs,
  Scripts,

  // Часто изменяемые
  DeviceItemValues,
  GroupMode,
  GroupStatus,
  Group_Param_Value,
}

export enum ChangeState {
  NoChange,
  Upsert,
  Delete,
}

export interface ChangeInfo<T> {
  state: ChangeState;
  obj: T;
}

export abstract class ChangeTemplate<T extends { id: number }> {
  changeState = ChangeState;
  changed: boolean;

  items: ChangeInfo<T>[] = [];
  sel_item: ChangeInfo<T>;

  constructor(
    private cmd: number,
    protected wsbService: WebSocketBytesService,
    public schemeService: SchemeService,
    private itemType: new () => T,
    private settingName: string,
  ) {
  }

  abstract getObjects(): T[];

  fillItems(): void {
    this.changed = false;
    this.items = [];
    let objects: T[] = this.getObjects();
    for (let obj of objects) {
      this.addItem(Object.assign({}, obj), false);
    }
  }

  select(item: ChangeInfo<T>): void {
    this.sel_item = (this.sel_item === item) ? undefined : item;
  }

  itemChanged(item: ChangeInfo<T> = undefined, state: ChangeState = ChangeState.Upsert): void {
    if (item === undefined) {
      item = this.sel_item;
    }
    if (item.state !== state) {
      item.state = state;
      if (!this.changed) {
        this.changed = true;
      }
    }
  }

  save(evnt: any = undefined): void {
    if (evnt !== undefined) {
      evnt.stopPropagation();
    }
    this.getChangedData();

    this.items = [];
    this.sel_item = null;
  }

  // TODO: rename and refactor. save2 is for code saving
  save2(evnt: any = undefined): void {
    if (evnt !== undefined) {
      evnt.stopPropagation();
    }
    // TODO
    let data = this.getChangedData();
    // this.wsbService.send(WebSockCmd.WS_STRUCT_MODIFY, this.schemeService.scheme.id, data);

    this.changed = false;
    this.sel_item.state = ChangeState.NoChange;
  }

  cancel(evnt: any = undefined): void {
    if (evnt !== undefined) {
      evnt.stopPropagation();
    }
    if (this.sel_item !== undefined) {
      this.select(this.sel_item);
    }
    this.fillItems();
  }

  initItem(obj: T): void {
  }

  create(): void {
    this.changed = true;
    let obj: T = new this.itemType();
    (<any>obj).id = 0;
    this.initItem(obj);
    this.addItem(obj);
  }

  addItem(obj: T, select: boolean = true): void {
    let item = {state: ChangeState.NoChange, obj: obj} as ChangeInfo<T>;
    this.items.push(item);
    if (select) {
      this.sel_item = item;
    }
  }

  remove(item: ChangeInfo<T>): void {
    this.itemChanged(item, ChangeState.Delete);
    // Dialog
  }

  abstract saveObject(obj: T): Uint8Array;

  getChangedData() {
    let data: (T | { id: number })[] = [];
    for (const item of this.items) {
      if (item.state === ChangeState.Delete) {
        data.push({ id: item.obj.id });
      } else if (item.state === ChangeState.Upsert) {
        if (item.obj.id > 0) {
          data.push(item.obj);
        } else {
          const itemWithoutId = { ...item.obj };
          delete itemWithoutId.id;
          data.push(itemWithoutId);
        }
      }
    }

    if (data.length > 0) {
        this.schemeService.postSettings(this.settingName, data);
    }
  }
}
