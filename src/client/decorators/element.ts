import { PlusElement } from '../../types/index.js';
import { isServer, proxy } from '../utils/index.js';

export function Element(tag?: string) {
  return function (constructor: PlusElement) {
    if (isServer()) return;
    // TODO: remove as any
    customElements.define(tag!, proxy(constructor) as any);
  };
}
