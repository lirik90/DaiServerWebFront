export class Codes { // Скрипт автоматизации
  id: number;   // ID
  name: string; // Имя
  text: string; // Скрипт
  global_id: number; // Global id
}

export class GroupType { // Тип группы
  id: number;           // ID
  name: string;         // Имя
  title: string;        // Заголовок
  code_id: number;      // ID скрипта автоматизации
  description: string;
}

export class SignType { // Еденица измерения
  id: number;   // ID
  name: string; // Еденица измерения
}

export class CheckerType { // Плагин работы с устройством
  id: number;   // ID
  name: string; // Имя плагина
}

export enum ItemTypeRegister { // Тип данных элемента
  Unknown,
  DiscreteInputs,   // Булевы значения только для чтения
  Coils,            // Булевы значения чтение/запись
  InputRegisters,   // Значения только для чтения
  HoldingRegisters, // Значения чтение/запись
  File,             // Передача файла
  SimpleButton,		// Обычная кнопка. Передает всегда значение 1
}

export enum SaveAlgorithmType { // Алгоритм сохранения изменений значения
  Unknown,
  DontSave,         // Не сохранять автоматически
  SaveImmediately,  // Сохранять немедленно
  SaveByTimer,      // Сохранять по таймеру
}

export class ItemType { // Тип элемента
  id: number;               // ID
  name: string;             // Имя элемента для использования в скриптах автоматизации
  title: string;            // Отображаемое имя элемента по-умолчанию
  isRaw: boolean;           // Флаг необходимости нармализации значения
  groupType_id: number;     // ID типа группы к которой может принадлежать элемент (Плохой?)
  sign_id: number;          // ID еденицы измерения
  sign: SignType;           // Еденица измерения
  registerType: number;     // Тип данных элемента
  saveAlgorithm: number;    // Алгоритм сохранения изменений значения
}

export class Section {
  id: number;       // ID
  name: string;     // Имя секции
  dayStart: number; // Время начала дня в секундах
  dayEnd: number;   // Время конца для в секундах
  groups: Group[];  // Группы
}

export class DeviceItem { // Элемент устройства
  id: number;         // ID
  parent_id: number;  // ID родителя
  device_id: number;  // ID устройства
  group_id: number;   // ID группы

  name: string;       // Имя
  type_id: number;    // ID типа
  type: ItemType;     // Тип
  extra: string;      // Пользовательские параметры

  value: any;         // Отображаемое значение
  raw_value: any;     // Сырое значение
}

export class StatusType {
  id: number;     // ID
  name: string;
  title: string;
  color: string;
}

export class Status {
  id: number;           // ID
  groupType_id: number;
  type_id: number;
  type: StatusType;
  name: string;
  text: string;
  isMultiValue: boolean;
  value: number;
  inform: boolean;
}

export class GroupStatus {
  status: Status;
  args: string[];
}

export class GroupStatusInfo {
  color: string;
  text: string;
  short_text: string;
}

export class Group {  // Группа
  id: number;               // ID
  section_id: number;       // ID секции
  type_id: number;          // ID типа группы
  mode_id: number;          // ID режима автоматизации
  type: GroupType;          // Тип группы
  items: DeviceItem[] = []; // Элементы в группе
  params: ParamValue[] = [];// Уставки
  status: number;           // Состояние
  statuses: GroupStatus[] = [];
  status_info: GroupStatusInfo;
}

export class View {  // Представление
  id: number;
  name: string;
  types: ItemType[] = [];
} 

export enum ParamType { // Тип значения уставки
  Unknown,
  Int,
  Bool,
  Float,
  String,
  Bytes,
  TimeType,
  RangeType,  // Используется для задания двух дочерних элементов
  ComboType,  // Используется для задания дочерних элементов (Кажется не реализованно)
}

export class ParamItem {  // Тип уставки
  id: number;               // ID
  groupType_id: number;     // ID типа группы к которой может принадлежать уставка
  parent_id: number;        // ID родителя
  childs: ParamItem[] = []; // Дочерние типы

  title: string;            // Отображаемое имя
  name: string;             // Имя латиницей используется в скриптах
  description: string;      // Описание
  type: number;             // Тип значения уставки
}

export class ParamValue { // Уставка
  id: number;       // ID
  group_id: number; // ID группы
  param_id: number; // ID типа уставки
  value: string;    // Значение
  param: ParamItem; // Тип уставки
}

export class Device { // Устройство
  id: number;         // ID
  address: number;    // Адрес
  name: string;       // Имя
  checker_id: number; // ID используемого плагина
  extra: string;         // Пользовательские параметры
  items: DeviceItem[];// Массив элементов
}

export class Logs { // Запись журнала изменений значения
//  id: number;     // ID
  date: string;     // Время изменения
  item_id: number;  // ID элемент
  raw_value: string;// Значение
  value: string;    // Отображаемое значение
  user_id: number;  // Пользователь
}

export enum EventLogType { // Тип события в журнале событий
  DebugEvent,
  WarningEvent,
  CriticalEvent,
  FatalEvent,
  InfoEvent,
  UserEvent
}

export class EventLog { // Запись в журнале событий
  id: number;         // ID
  date: Date;       // Время события
  who: string;        // Категория
  msg: string;        // Сообщение
  type: number;       // Тип события
  user_id: number;    // Пользователь
  color: string = ''; // Цвет?

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
  id: number;     // ID
  param: string;
  value: string;
}

export class HouseDetail {
  id: number;             // ID проекта
  name: string;           // Имя проекта

  devices: Device[];      // Устройства и их элементы в системе
  sections: Section[];    // Наполнение секций
  params: ParamItem[];    // Типы уставок
  groupTypes: GroupType[];// Типы групп
  itemTypes: ItemType[];  // Типы элементов
  signTypes: SignType[];  // Еденицы измерения
  statusTypes: StatusType[];  // Типы состояний
  statuses: Status[];  // Состояния
}

