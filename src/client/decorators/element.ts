import { defineElement, proxy } from '../utils/index.js';

export function Element(tag?: string) {
  return function (constructor: Function) {
    defineElement(tag!, proxy(constructor));
  };
}
