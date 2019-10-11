import {Inject, Injectable} from '@angular/core';
import {DOCUMENT} from '@angular/platform-browser';
import {ISubscription} from 'rxjs/Subscription';
import {Subject} from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import {HouseService} from './house.service';
import {ByteMessage, ByteTools, WebSocketBytesService} from '../web-socket.service';
import {DeviceItem, EventLog, Group, ParamValue, Status} from './house';

// import { QByteArray } from 'qtdatastream/src/types';

export enum WebSockCmd {
  WS_UNKNOWN,
  WS_AUTH,
  WS_WELCOME,

  WS_CONNECTION_STATE,
  WS_WRITE_TO_DEV_ITEM,
  WS_CHANGE_GROUP_MODE,
  WS_CHANGE_GROUP_PARAM_VALUES,
  WS_EXEC_SCRIPT,
  WS_RESTART,

  WS_DEV_ITEM_VALUES,
  WS_EVENT_LOG,
  WS_GROUP_MODE,

  WS_STRUCT_MODIFY,

  WS_GROUP_STATUS_ADDED,
  WS_GROUP_STATUS_REMOVED,
  WS_TIME_INFO,
  WS_IP_ADDRESS,

  WEB_SOCK_CMD_COUNT
}

export enum Connection_State {
  CS_SERVER_DOWN,
  CS_DISCONNECTED,
  CS_DISCONNECTED_JUST_NOW,
  CS_CONNECTED_JUST_NOW,
  CS_CONNECTED_SYNC_TIMEOUT,
  CS_CONNECTED,

  CS_CONNECTED_WITH_LOSSES = 0x40,
  CS_CONNECTED_MODIFIED = 0x80
}

export interface ConnectInfo {
  connected: boolean;
  ip: string;
  time: number;
  time_zone: string;
  modified: boolean;
}

class TimeInfo {
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
    @Inject(DOCUMENT) private document) {
    this.opened = wsbService.opened;
  }

  open(): void {
    this.bmsg_sub = this.wsbService.message.subscribe((msg: ByteMessage) => {
      /*
      console.log(msg);
      console.log(this.houseService);
      */

      if (!this.houseService.house || (msg.proj_id != this.houseService.house.id && msg.proj_id != 0 )) {
        return;
      }

      if (msg.cmd == WebSockCmd.WS_GROUP_MODE) {
        if (msg.data === undefined) {
          console.log('GroupMode without data');
          return;
        }

        const view = new Uint8Array(msg.data);
        const [start, mode_id] = ByteTools.parseUInt32(view);
        const [start1, group_id] = ByteTools.parseUInt32(view, start);

        for (const sct of this.houseService.house.sections) {
          for (const group of sct.groups) {
            if (group.id == group_id) {
              group.mode = mode_id;
              return;
            }
          }
        }
      } else if (msg.cmd == WebSockCmd.WS_DEV_ITEM_VALUES) {

        if (msg.data === undefined) {
          console.log('DevItemValues without data');
          return;
        }

        const view = new Uint8Array(msg.data);
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

          /*
          console.log('dev_value');
          console.log('item_id:' + item_id);
          console.log('raw_value:' + raw_value);
          console.log('value:' + value);
*/

          // console.log(`Parse value ${item_id} ${raw_value} ${value}`);
          this.procDevItemValue(item_id, raw_value, value);
        }

        if (idx != msg.data.byteLength) {
          console.warn(`BAD PARSE POSITION ${idx} NEED ${msg.data.byteLength} ${JSON.stringify(view)}`);
        }
      } else if (msg.cmd == WebSockCmd.WS_CHANGE_GROUP_PARAM_VALUES) {
        const set_param_impl = (group: Group, prm_id: number, value: string) => {
          if (group !== undefined && group.params !== undefined) {
            for (const param of group.params) {
              if (param.id == prm_id) {
                param.value = value;
                return true;
              }
            }
          }
          return false;
        };

        let last_group: Group;
        const set_param = (prm_id: number, value: string) => {
          if (set_param_impl(last_group, prm_id, value)) {
            return;
          }
          for (const sct of this.houseService.house.sections) {
            for (const group of sct.groups) {
              if (set_param_impl(group, prm_id, value)) {
                if (last_group !== group) {
                  last_group = group;
                }
                return;
              }
            }
          }
        };

        const view = new Uint8Array(msg.data);
        let [idx, count] = ByteTools.parseUInt32(view);
        let param_id: number;
        while (count--) {
          param_id = ByteTools.parseUInt32(view, idx)[1];
          idx += 4;

          const [ last_pos, value ] = ByteTools.parseQString(view, idx);
          idx = last_pos;

          set_param(param_id, value);
        }
      } else if (msg.cmd == WebSockCmd.WS_GROUP_STATUS_ADDED) {
        const view = new Uint8Array(msg.data);
        const group_id = ByteTools.parseUInt32(view)[1];
        const info_id = ByteTools.parseUInt32(view, 4)[1];
        let [idx, args_count] = ByteTools.parseUInt32(view, 8);
        const args: string[] = [];

        while (args_count--) {
          const [ last_pos, value ] = ByteTools.parseQString(view, idx);
          idx = last_pos;
          args.push(value);
        }

        for (const sct of this.houseService.house.sections) {
          for (const group of sct.groups) {
            if (group.id == group_id) {
              if (group.statuses === undefined) {
                group.statuses = [];
              }
              for (const gsts of group.statuses) {
                if (gsts.status.id == info_id) {
                  gsts.args = args;
                  return;
                }
              }

              let status_item: Status;
              for (const sts of this.houseService.house.statuses) {
                if (sts.id == info_id) {
                  status_item = sts;
                }
              }

              if (status_item === undefined) {
                console.warn(`Status id ${info_id} not found`);
              } else {
                group.statuses.push({ status: status_item, args: args, status_id: info_id });
                this.houseService.calculateStatusInfo(group);
              }
              return;
            }
          }
        }

      } else if (msg.cmd == WebSockCmd.WS_GROUP_STATUS_REMOVED) {
        const view = new Uint8Array(msg.data);
        const group_id = ByteTools.parseUInt32(view)[1];
        const info_id = ByteTools.parseUInt32(view, 4)[1];
        for (const sct of this.houseService.house.sections) {
          for (const group of sct.groups) {
            if (group.id == group_id) {
              if (group.statuses === undefined) {
                group.statuses = [];
              }
              let l = group.statuses.length;
              while (l--) {
                if (group.statuses[l].status.id == info_id) {
                  group.statuses.splice(l, 1);
                  this.houseService.calculateStatusInfo(group);
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

    const protocol = window.location.protocol.replace('http', 'ws'); // http: -> ws: , https: -> wss:
    const host = window.location.host; // With port -> localhost:4200
    const ws_url = `${protocol}//${host}/${protocol}`;
    this.wsbService.start(ws_url.replace(/:$/, '/'));
	}

  close(): void {
    this.bmsg_sub.unsubscribe();
    this.wsbService.close();
  }

  private procDevItemValue(item_id: number, raw_value: any, value: any): void {
    const item: DeviceItem = this.houseService.devItemById(item_id);
    if (item) {
      if (!item.val) {
        item.val = { raw: raw_value, display: value };
      } else {
        item.val.raw = raw_value;
        item.val.display = value;
      }
    }
  }

  parseConnectNumber(n: number) {
    // tslint:disable:no-bitwise
    const connState = n & ~Connection_State.CS_CONNECTED_MODIFIED & ~Connection_State.CS_CONNECTED_WITH_LOSSES;
    const modState = (n & Connection_State.CS_CONNECTED_MODIFIED) === Connection_State.CS_CONNECTED_MODIFIED;
    const losesState = (n & Connection_State.CS_CONNECTED_WITH_LOSSES) === Connection_State.CS_CONNECTED_WITH_LOSSES;
    // tslint:enable:no-bitwise

    return [connState, modState, losesState];
  }

  parseConnectState(data: ArrayBuffer): any[] {
    if (data === undefined) {
      return;
    }

    const view = new Uint8Array(data);

    return this.parseConnectNumber(view[0]);
  }

  parseTimeInfo(data: ArrayBuffer): TimeInfo {
    if (data === undefined) {
      return;
    }

    const view = new Uint8Array(data);

    const [start1, time] = ByteTools.parseInt64(view, 0);
    const [start2, time_zone] = ByteTools.parseQString(view, start1);
    const modified: boolean = view[start2] == 1;
    return { time, time_zone, modified };
  }

  /* DEPRECATED */
  parseConnectInfo(data: ArrayBuffer): ConnectInfo {
    if (data === undefined) {
      return;
    }

    const view = new Uint8Array(data);
    const connected: boolean = view[0] == 1;
    const [start, ip] = ByteTools.parseQString(view, 1);
    const [start1, time] = ByteTools.parseInt64(view, start);
    const [start2, time_zone] = ByteTools.parseQString(view, start1);
    const modified: boolean = view[start2] == 1;
    return { connected, ip, time, time_zone, modified };
  }

  parseEventMessage(data: ArrayBuffer): EventLog[] {
    if (data === undefined) {
      return;
    }


    const items: EventLog[] = [];
    const view = new Uint8Array(data);
    let [start1, count] = ByteTools.parseUInt32(view);
    while (count--) {
      const [start2, time_ms] = ByteTools.parseInt64(view, start1);
      const [start3, user_id] = ByteTools.parseUInt32(view, start2);
      const type = view[start3] & ~0x80;
      const [start5, who] = ByteTools.parseQString(view, start3 + 1);
      const [start6, msg] = ByteTools.parseQString(view, start5);
      start1 = start6;
      items.push({date: new Date(time_ms), text: msg, category: who, type_id: type, user_id, color: '' } as EventLog);
    }
    return items;
  }

  getConnectInfo(): void {
    this.wsbService.send(WebSockCmd.WS_CONNECTION_STATE, this.houseService.house.id);
  }

  writeToDevItem(item_id: number, value: any): void {
    const value_buf = ByteTools.saveQVariant(value);

    const view = new Uint8Array(4 + value_buf.length);
    ByteTools.saveInt32(item_id, view);
    view.set(value_buf, 4);

    this.wsbService.send(WebSockCmd.WS_WRITE_TO_DEV_ITEM, this.houseService.house.id, view);
  }

  changeGroupMode(value: any, group_id: number): void {
    const view = new Uint8Array(8);
    ByteTools.saveInt32(+value, view);
    ByteTools.saveInt32(group_id, view, 4);
    console.log(`MODE ${value} GROUP ${group_id}`);
    this.wsbService.send(WebSockCmd.WS_CHANGE_GROUP_MODE, this.houseService.house.id, view);
  }

  changeParamValues(params: ParamValue[]): void {
    if (!params.length) {
      return;
    }

    let msg_size = 0;
    let string_buf: Uint8Array;
    let view: Uint8Array;
    const data_list: Uint8Array[] = [];
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
    let start = 4;
    for (const data of data_list) {
      view.set(data, start);
      start += data.length;
    }

    this.wsbService.send(WebSockCmd.WS_CHANGE_GROUP_PARAM_VALUES, this.houseService.house.id, view);
  }

  restart(): void {
    this.wsbService.send(WebSockCmd.WS_RESTART, this.houseService.house.id);
  }

  execScript(script: string) {
    const view = ByteTools.saveQString(script);
    this.wsbService.send(WebSockCmd.WS_EXEC_SCRIPT, this.houseService.house.id, view);
  }

  exec_function(func_name: string, args: any[]): void {
    const arg_list: any[] = [];
    let args_size = 0;
    for (const arg of args) {
      const arg_var = ByteTools.saveQVariant(arg);
      args_size += arg_var.length;
      arg_list.push(arg_var);
    }

    const func_name_view = ByteTools.saveQString(func_name);
    const view = new Uint8Array(func_name_view.length + 4 + args_size);
    let pos = 0;
    view.set(func_name_view, pos); pos += func_name_view.length;
    ByteTools.saveInt32(args.length, view, pos); pos += 4;
    for (const data of arg_list) {
      view.set(data, pos);
      pos += data.length;
    }
    this.wsbService.send(WebSockCmd.WS_EXEC_SCRIPT, this.houseService.house.id, view);
  }
} // end class ControlService
