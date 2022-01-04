import { define, proxy } from '../utils/index.js';

export function Element(tag?: string) {
  return function (constructor: Function) {
    define(tag || '', proxy(constructor));
  };
}
