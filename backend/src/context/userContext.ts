import { AsyncLocalStorage } from 'async_hooks';

// Definimos o que queremos guardar no "bolso"
export interface IUserContext {
  userId: number;
  userName: string;
  ip: string;
}

export const userContextStorage = new AsyncLocalStorage<IUserContext>();
