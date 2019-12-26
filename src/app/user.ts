import {Connection_State} from './house/control.service';

export interface PaginatorApi<T> {
  results: T[];     // Массив данных
  count: number;    // Общее кол-во элементов в базе
  next: string;
  previous: string;
}

export class TeamMember {
  id: number;
  name: string;
}

export class User {
    id: number;
    username: string;
    password: string;
    first_name: string;
    last_name: string;
    email: string;
    token: string;        // Ключ сессии
    permissions: string[];// Разрешения доступные пользователю
    phone_number: string;
}
export class House {
  id: number;
  name: string;       // Имя прокта латиницей и без спец. символов, используется как имя базы данных
  device: string;     // UUID проекта
  lastUsage: string;
  title: string;      // Отображаемое имя проекта
  city: number | null;
  company: number | null;
  description: string;
  version: string;
  messages: any[];
  parent: number;
  connection: number;
  mod_state: boolean;
  loses_state: boolean;
  status_checked: boolean;
  connect_state: Connection_State;
}

