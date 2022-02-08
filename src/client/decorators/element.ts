import { PlusElement } from '../../types';
import { isServer, proxy } from '../utils';

export function Element(tag?: string) {
  return function (constructor: PlusElement) {
    if (isServer()) return;
    // TODO: remove as any
    customElements.define(tag!, proxy(constructor) as any);
  };
}
