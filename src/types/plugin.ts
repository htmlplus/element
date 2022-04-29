import { Context } from './context.js';
import { Global } from './global';

export type Return<T> = void | T | Promise<T>;

export type Plugin = {
  name: string;
  start?: (global: Global) => Return<Global>;
  next?: (context: Context, global: Global) => Return<Context>;
  finish?: (global: Global) => Return<Global>;
};
