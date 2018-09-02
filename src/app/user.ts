export interface PaginatorApi<T> {
  results: T[];
  count: number;
  next: string;
  previous: string;
}

export class User {
    id: number;
    username: string;
    password: string;
    first_name: string;
    last_name: string;
    email: string;
    token: string;
    permissions: string[];
}
export class House {
  id: number;
  name: string;
  device: string;
  lastUsage: string;
  title: string;
  description: string;
}

