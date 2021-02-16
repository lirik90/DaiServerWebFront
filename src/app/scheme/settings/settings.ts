import {SchemeService} from '../scheme.service';

export enum Structure_Type {
    ST_UNKNOWN,
    ST_DEVICE,
    ST_PLUGIN_TYPE,
    ST_DEVICE_ITEM,
    ST_DEVICE_ITEM_TYPE,
    ST_SAVE_TIMER,
    ST_SECTION,
    ST_DEVICE_ITEM_GROUP,
    ST_DIG_TYPE,
    ST_DIG_MODE_TYPE,
    ST_DIG_PARAM_TYPE,
    ST_DIG_STATUS_TYPE,
    ST_DIG_STATUS_CATEGORY,
    ST_DIG_PARAM,
    ST_SIGN_TYPE,
    ST_CODE_ITEM,
    ST_TRANSLATION,
    ST_NODE,
    ST_DISABLED_PARAM,
    ST_DISABLED_STATUS,
    ST_CHART,
    ST_CHART_ITEM,
    ST_VALUE_VIEW,
    ST_AUTH_GROUP,
    ST_AUTH_GROUP_PERMISSION,
    ST_USER,
    ST_USER_GROUP,

  // Часто изменяемые
    ST_DEVICE_ITEM_VALUE,
    ST_DIG_MODE,
    ST_DIG_PARAM_VALUE,
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
    this.saveSettings();

    this.items = [];
    this.sel_item = null;
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

  saveSettings(): void {
    let data: (T | { id: number })[] = [];
    for (const item of this.items) {
      if (item.state === ChangeState.Delete) {
          data.push({ id: item.obj.id });
      } else if (item.state === ChangeState.Upsert) {
          data.push(item.obj);
      }
    }

    if (data.length > 0) {
        this.schemeService.postSettings(this.settingName, data).subscribe(() => {});
    }
  }
}
