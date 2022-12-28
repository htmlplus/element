import { Context } from './context';
import { Global } from './global';

export type Return<T> = void | T | Promise<void | T>;

export type Plugin = {
  name: string;
  options?: any;
  start?: (global: Global) => Return<Global>;
  run?: (context: Context, global: Global) => Return<Context>;
  finish?: (global: Global) => Return<Global>;
};
