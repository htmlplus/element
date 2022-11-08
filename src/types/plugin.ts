import { Context } from './context';
import { Global } from './global';

export type Return<T> = void | T | Promise<T>;

export type Plugin = {
  name: string;
  options?: any;
  start?: (global: Global) => Return<void>;
  next?: (context: Context, global: Global) => Return<any>;
  finish?: (global: Global) => Return<void>;
};
