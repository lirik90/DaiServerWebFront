import { ByteTools } from "../../web-socket.service";

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
  constructor() {}

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
 
  cancel(): void {
    if (this.sel_item !== undefined)
      this.select(this.sel_item);
    this.fillItems();
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
    let size = 0;
    let data;
    let data_list = [];
    let flag_array = [];
    for (const item of this.items) {
      data = this.saveObject(item.obj);
      size += data.length;
      data_list.push(data);
      flag_array.push(item.state === ChangeState.Delete ? 0 : 1);
    }
    let count = flag_array.length;
    let flag = 0;
    let flag_data = [];
    let view = new Uint8Array(4 + size + Math.ceil(count / 8));
    ByteTools.saveInt32(this.items.length, view);
    let pos = 4;
    for (let i = 0; i < count; ++i) {
      data = data_list[i];
      view.set(data, pos);
      pos += data.length;
      flag ^= (-flag_array[i] ^ flag) & (1 << (i % 8));
      if ((i+1) % 8 === 0) {
        flag_data.push(flag);
        flag = 0;
      }
    }
    if (count % 8 !== 0)
      flag_data.push(flag);
    do {
      view[pos] = flag;
    } while(++pos < view.length);
    return view;
  }

}
