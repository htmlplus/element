import { Context } from './context.js';

export type Return<T> = void | T | Promise<T>;

export type Plugin = {
  name: string;
  start?: (global: any) => Return<any>;
  next?: (context: Context, global: any) => Return<Context>;
  finish?: (global: any) => Return<any>;
};
