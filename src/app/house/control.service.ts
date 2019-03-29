import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { ISubscription } from "rxjs/Subscription";
import { Subject } from 'rxjs/Subject';
import { empty } from 'rxjs/observable/empty';
import { catchError, map, tap, startWith, switchMap } from 'rxjs/operators';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
// import { QByteArray } from 'qtdatastream/src/types';

import { HouseService } from "./house.service";
import { WebSocketBytesService, ByteMessage, ByteTools } from '../web-socket.service';
import { DeviceItem, Group, Status, EventLog, ParamValue } from './house';

export enum Cmd {
  ConnectInfo = 3, // WebSockCmd.UserCmd
  WriteToDevItem,
  ChangeGroupMode,
  ChangeParamValues,
  ExecScript,
  Restart,
  DevItemValues,
  Eventlog,
  GroupMode,
  StructModify,
  GroupStatusAdded,
  GroupStatusRemoved,
}

export interface ConnectInfo {
  connected: boolean;
  ip: string;
  time: number;
  time_zone: string;
  modified: boolean;
}

@Injectable()
export class ControlService {
	public byte_msg: Subject<ByteMessage> = new Subject<ByteMessage>();
  public opened: Subject<boolean>;

  private bmsg_sub: ISubscription;

	constructor(
    private wsbService: WebSocketBytesService,
    private houseService: HouseService,
    @Inject(DOCUMENT) private document)
  {
    this.opened = wsbService.opened;
  }

  open(): void {
    this.bmsg_sub = this.wsbService.message.subscribe((msg: ByteMessage) => {
      if (!this.houseService.house || msg.proj_id != this.houseService.house.id) {
        return;
      }

      if (msg.cmd == Cmd.GroupMode) {
        if (msg.data === undefined) {
          console.log('GroupMode without data');
          return;
        }

        let view = new Uint8Array(msg.data);
        let [start, mode_id] = ByteTools.parseUInt32(view);
        let [start1, group_id] = ByteTools.parseUInt32(view, start);

        for (let sct of this.houseService.house.sections) {
          for (let group of sct.groups) {
            if (group.id == group_id) {
              group.mode_id = mode_id;
              return;
            }
          }
        }
      } else if (msg.cmd == Cmd.DevItemValues) {
        if (msg.data === undefined) {
          console.log('DevItemValues without data');
          return;
        }

        let view = new Uint8Array(msg.data);
        let [idx, count] = ByteTools.parseUInt32(view);
        let item_id: number;
        while (count--) {
          item_id = ByteTools.parseUInt32(view, idx)[1];
          idx += 4;

          const [ last_pos1, raw_value ] = ByteTools.parseQVariant(view, idx);
          idx = last_pos1;
          if (idx >= msg.data.byteLength) {
            console.log(`bad raw length ${idx} ${msg.data.byteLength} ${raw_value}`);
            break;
          }

          const [ last_pos2, value ] = ByteTools.parseQVariant(view, idx);
          idx = last_pos2;
          if (idx > msg.data.byteLength) {
            console.log(`bad length ${idx} ${msg.data.byteLength} ${value}`);
            break;
          }

          // console.log(`Parse value ${item_id} ${raw_value} ${value}`);
          this.procDevItemValue(item_id, raw_value, value);
        }

        if (idx != msg.data.byteLength)
          console.warn(`BAD PARSE POSITION ${idx} NEED ${msg.data.byteLength} ${JSON.stringify(view)}`);
      } else if (msg.cmd == Cmd.ChangeParamValues) {
        let set_param_impl = (group: Group, prm_id: number, value: string) => {
          if (group !== undefined && group.params !== undefined)
            for (let param of group.params) {
              if (param.id == prm_id) {
                param.value = value;
                return true;
              }
            }
          return false;
        };

        let last_group: Group = undefined;
        let set_param = (prm_id: number, value: string) => {
          if (set_param_impl(last_group, prm_id, value))
            return;
          for (let sct of this.houseService.house.sections) {
            for (let group of sct.groups) {
              if (set_param_impl(group, prm_id, value)) {
                if (last_group !== group)
                  last_group = group;
                return;
              }
            }
          }
        };

        let view = new Uint8Array(msg.data);
        let [idx, count] = ByteTools.parseUInt32(view);
        let param_id: number;
        while (count--) {
          param_id = ByteTools.parseUInt32(view, idx)[1];
          idx += 4;

          const [ last_pos, value ] = ByteTools.parseQString(view, idx);
          idx = last_pos;

          set_param(param_id, value);
        }
      } else if (msg.cmd == Cmd.GroupStatusAdded) {
        let view = new Uint8Array(msg.data);
        let group_id = ByteTools.parseUInt32(view)[1];
        let info_id = ByteTools.parseUInt32(view, 4)[1];
        let [idx, args_count] = ByteTools.parseUInt32(view, 8);
        let args: string[] = [];

        while(args_count--) {
          const [ last_pos, value ] = ByteTools.parseQString(view, idx);
          idx = last_pos;
          args.push(value);
        }

        for (let sct of this.houseService.house.sections) {
          for (let group of sct.groups) {
            if (group.id == group_id) {
              if (group.statuses === undefined)
                group.statuses = [];
              for (let gsts of group.statuses) {
                if (gsts.status.id == info_id)
                  return;
              }
    
              let status_item: Status = undefined;
              for (let sts of this.houseService.house.statuses) {
                if (sts.id == info_id) {
                  status_item = sts;
                }
              }

              if (status_item === undefined)
                console.warn(`Status id ${info_id} not found`);
              else {
                group.statuses.push({ status: status_item, args: args });
                this.calculateStatusInfo(group);
              }
              return;
            }
          }
        }

      } else if (msg.cmd == Cmd.GroupStatusRemoved) {
        let view = new Uint8Array(msg.data);
        let group_id = ByteTools.parseUInt32(view)[1];
        let info_id = ByteTools.parseUInt32(view, 4)[1];
        for (let sct of this.houseService.house.sections) {
          for (let group of sct.groups) {
            if (group.id == group_id) {
              if (group.statuses === undefined)
                group.statuses = [];
              let l = group.statuses.length;
              while (l--) {
                if (group.statuses[l].status.id == info_id) {
                  group.statuses.slice(l, 1);
                  this.calculateStatusInfo(group);
                  return;
                }
              }
              return;
            }
          }
        }
      } else {
        this.byte_msg.next(msg);
      }
    });

    const domain_zone = document.location.hostname.split('.').pop();
    let proto = 'ws';
    if (domain_zone !== 'local')
      proto += 's'; 
    this.wsbService.start(proto + '://' + document.location.hostname + '/' + proto + '/');
	}

  private calculateStatusInfo(group: Group): void {
    let strings: string[] = [];
    let str;
    let color = 'green';
    let short_text = 'Ok';
    let last_error_level = 0;

    for (let sts of group.statuses) {
      if (sts.status.type_id > last_error_level) {
        last_error_level = sts.status.type_id;
        color = sts.status.type.color;
        short_text = sts.status.type.name;
      }
      str = sts.status.text;
      let l = sts.args !== undefined ? sts.args.length : 0;
      while (l--)
        str = str.replace('%' + (l + 1), sts.args[l]);
      strings.push(str);
    }

    group.status_info = { color, short_text, text: strings.join('\n') };
  }

  close(): void {
    this.bmsg_sub.unsubscribe();
    this.wsbService.close();
  }

  private procDevItemValue(item_id: number, raw_value: any, value: any): void {
    let item: DeviceItem = this.houseService.devItemById(item_id);
    if (item) {
      item.raw_value = raw_value;
      item.value = value;
    }
  }

  parseConnectInfo(data: ArrayBuffer): ConnectInfo {
    if (data === undefined)
      return;

    let view = new Uint8Array(data);
    const connected: boolean = view[0] == 1;
    const [start, ip] = ByteTools.parseQString(view, 1);
    const [start1, time] = ByteTools.parseInt64(view, start);
    const [start2, time_zone] = ByteTools.parseQString(view, start1);
    const modified: boolean = view[start2] == 1;
    return { connected, ip, time, time_zone, modified };
  }

  parseEventMessage(data: ArrayBuffer): EventLog[]
  {
    if (data === undefined)
      return;

    let items: EventLog[] = [];
    let view = new Uint8Array(data);
    let [start, count] = ByteTools.parseUInt32(view);
    while (count--)
    {
      const [start1, id] = ByteTools.parseUInt32(view, start);
      const [start2, time_ms] = ByteTools.parseInt64(view, start1);
      const [start3, user_id] = ByteTools.parseUInt32(view, start2);
      const [start4, type] = ByteTools.parseUInt32(view, start3);
      const [start5, who] = ByteTools.parseQString(view, start4);
      const [start6, msg] = ByteTools.parseQString(view, start5);
      start = start6;
      items.push({ id, date: new Date(time_ms), who, msg, type, user_id, color: '' } as EventLog);
    }
    return items;
  }

  getConnectInfo(): void {
    this.wsbService.send(Cmd.ConnectInfo, this.houseService.house.id);
  }

  writeToDevItem(item_id: number, value: any): void {
    let value_buf = ByteTools.saveQVariant(value);

    let view = new Uint8Array(4 + value_buf.length);
    ByteTools.saveInt32(item_id, view);
    view.set(value_buf, 4);

    this.wsbService.send(Cmd.WriteToDevItem, this.houseService.house.id, view);
  }

  changeGroupMode(value: any, group_id: number): void {
    let view = new Uint8Array(8);
    ByteTools.saveInt32(+value, view);
    ByteTools.saveInt32(group_id, view, 4);
    console.log(`MODE ${value} GROUP ${group_id}`);
    this.wsbService.send(Cmd.ChangeGroupMode, this.houseService.house.id, view);
  }

  changeParamValues(params: ParamValue[]): void {
    if (!params.length)
      return;

    let msg_size: number = 0;
    let string_buf: Uint8Array;
    let view: Uint8Array;
    let data_list: Uint8Array[] = [];
    for (const data of params) {
      string_buf = ByteTools.saveQString(data.value ? data.value.toString() : null);
      view = new Uint8Array(4 + string_buf.length);
      ByteTools.saveInt32(data.id, view);
      view.set(string_buf, 4);
      data_list.push(view);
      msg_size += view.length;
    }

    view = new Uint8Array(4 + msg_size);
    ByteTools.saveInt32(params.length, view);
    let start: number = 4;
    for (const data of data_list) {
      view.set(data, start);
      start += data.length;
    }

    this.wsbService.send(Cmd.ChangeParamValues, this.houseService.house.id, view);
  }

  restart(): void {
    this.wsbService.send(Cmd.Restart, this.houseService.house.id);
  }

  execScript(script: string) {
    const view = ByteTools.saveQString(script);
    this.wsbService.send(Cmd.ExecScript, this.houseService.house.id, view);
  }
} // end class ControlService
