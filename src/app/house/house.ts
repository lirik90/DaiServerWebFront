export class Codes {
  id: number;
  name: string;
  text: string;
}

export class GroupType {
  id: number;
  name: string;
  title: string;
  code_id: number;
  description: string;
}

export class SignType {
  id: number;
  name: string;
}

export class CheckerType {
  id: number;
  name: string;
}

export enum ItemTypeRegister {
  Unknown,
  DiscreteInputs,
  Coils,
  InputRegisters,
  HoldingRegisters,
}

export class ItemType {
  id: number;
  name: string;
  title: string;
  isRaw: boolean;
  groupType_id: number;
  groupDisplay: boolean;
  sign_id: number;
  sign: SignType;
  registerType: number;
  saveImmediately: boolean;
}

export class Section {
  id: number;
  name: string;
  dayStart: number;
  dayEnd: number;
  groups: Group[];
}

export class DeviceItem {
  id: number;
  parent_id: number;
  device_id: number;
  group_id: number;
  
  unit: number;
  name: string;
  type_id: number;
  type: ItemType;

  value: any;
  raw_value: any;
}

export class Group {
  id: number;
  section_id: number;
  type_id: number;
  mode_id: number;
  type: GroupType;
  items: DeviceItem[] = [];
  params: ParamValue[] = [];

  status: number;
}

export enum ParamType {
  Unknown,
  Int,
  Bool,
  Float,
  String,
  Bytes,
  TimeType,
  RangeType,
  ComboType,
}

export class ParamItem {
  id: number;
  groupType_id: number;
  parent_id: number;
  childs: ParamItem[] = [];
  
  title: string;
  name: string;
  description: string;
  type: number;
}

export class ParamValue {
  id: number;
  group_id: number;
  param_id: number;
  value: string;

  param: ParamItem;
}

export class Device {
  id: number;
  address: number;
  name: string;
  checker_id: number;
  items: DeviceItem[];
}

export class Logs {
//  id: number;
  date: string;
  item_id: number;
  raw_value: string;
  value: string;
}

export enum EventLogType {
  DebugEvent,
  WarningEvent,
  CriticalEvent,
  FatalEvent,
  InfoEvent,
  UserEvent
}

export class EventLog {
  id: number;
  date: string;
  who: string;
  msg: string;
  type: number;
  color: string = '';
  
/*
  Types: any = {
    0: 'DebugEvent',
    4: 'InfoEvent',
    1: 'WarningEvent',
    2: 'CriticalEvent',
    3: 'FatalEvent',
    5: 'UserEvent',
  };*/
}

export class Settings {
  id: number;
  param: string;
  value: string;
}

export class StatusType {
  id: number;
  name: string;
  title: string;
  color: string;
}

export class Status {
  id: number;
  groupType_id: number;
  type_id: number;
  name: string;
  text: string;
  isMultiValue: boolean;
  value: number;
  inform: boolean;
}

export class HouseDetail {
  id: number;
  name: string;

  sections: Section[];
  devices: Device[];
  params: ParamItem[];
  groupTypes: GroupType[];
  itemTypes: ItemType[];
  signTypes: SignType[];
}

