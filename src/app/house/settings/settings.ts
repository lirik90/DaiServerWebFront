import { ByteTools, WebSocketBytesService } from "../../web-socket.service";
import { HouseService } from "../house.service";

export enum ChangeState {
  NoChange,
  Upsert,
  Delete,
}

export interface ChangeInfo<T> {
  state: ChangeState;
  obj: T;
}

export abstract class ChangeTemplate<T> {
  changeState = ChangeState;
  changed: boolean;

  items: ChangeInfo<T>[];
  sel_item: ChangeInfo<T>;
  constructor(
    private cmd: number,
    private wsbService: WebSocketBytesService,
    public houseService: HouseService,
    private itemType: new () => T) {}

  abstract getObjects(): T[];

  fillItems(): void {
    this.changed = false;
    this.items = [];
    let objects: T[] = this.getObjects();
    for (let obj of objects)
      this.addItem(Object.assign({}, obj), false);
  }

  select(item: ChangeInfo<T>): void {
    this.sel_item = (this.sel_item === item) ? undefined : item;
  }

  itemChanged(item: ChangeInfo<T> = undefined, state: ChangeState = ChangeState.Upsert): void {
    if (item === undefined)
      item = this.sel_item;
    if (item.state !== state) {
      item.state = state;
      if (!this.changed)
        this.changed = true;
    }
  }

  save(evnt: any = undefined): void {
    if (evnt !== undefined)
      evnt.stopPropagation();
    let data = this.getChangedData();
    this.wsbService.send(this.cmd, this.houseService.house.id, data);
  }

  cancel(evnt: any = undefined): void {
    if (evnt !== undefined)
      evnt.stopPropagation();
    if (this.sel_item !== undefined)
      this.select(this.sel_item);
    this.fillItems();
  }

  initItem(obj: T): void {}

  create(): void {
    this.changed = true;
    let obj: T = new this.itemType();
    (<any>obj).id = 0;
    this.initItem(obj);
    this.addItem(obj);
  }

  addItem(obj: T, select: boolean = true): void {
    let item = { state: ChangeState.NoChange, obj: obj } as ChangeInfo<T>;
    this.items.push(item);
    if (select)
      this.sel_item = item;
  }

  remove(item: ChangeInfo<T>): void {
    this.itemChanged(item, ChangeState.Delete);
    // Dialog
  }

  abstract saveObject(obj: T): Uint8Array;

  getChangedData(): Uint8Array {
    let data;
    let updateSize = 0;
    let insertSize = 0;
    let updateList = [];
    let insertList = [];
    let deleteList = [];
    for (const item of this.items) {
      if (item.state === ChangeState.Delete) {
        deleteList.push((<any>item.obj).id);
      } else if (item.state === ChangeState.Upsert) {
        data = this.saveObject(item.obj);

        if ((<any>item.obj).id > 0) {
          updateSize += data.length;
          updateList.push(data);
        } else {
          insertSize += data.length;
          insertList.push(data);
        }
      }
    }

    let view = new Uint8Array(12 + updateSize + insertSize + (deleteList.length * 4));

    ByteTools.saveInt32(updateList.length, view);
    let pos = 4;
    for (const data of updateList) {
      view.set(data, pos);
      pos += data.length;
    }

    ByteTools.saveInt32(insertList.length, view, pos);
    pos += 4;
    for (const data of insertList) {
      view.set(data, pos);
      pos += data.length;
    }

    ByteTools.saveInt32(deleteList.length, view, pos);
    pos += 4;
    for (const id of deleteList) {
      ByteTools.saveInt32(id, view, pos);
      pos += 4;
    }

    return view;
  }
}
