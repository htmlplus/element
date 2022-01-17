import { PlusElement } from '../../types/index.js';
import { defineElement, proxy } from '../utils/index.js';

export function Element(tag?: string) {
  return function (constructor: PlusElement) {
    defineElement(tag!, proxy(constructor));
  };
}
