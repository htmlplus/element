import * as CONSTANTS from '../../constants/index.js';
import { PlusElement } from '../../types';
import { appendToMethod, host, on, off } from '../utils/index.js';
import { Bind } from './bind.js';

export interface ListenOptions {
  capture?: boolean;
  once?: boolean;
  passive?: boolean;
  signal?: AbortSignal;
  target?: 'host' | 'body' | 'document' | 'window';
}

/**
 * The default options.
 */
export const ListenOptionsDefault: ListenOptions = {
  target: 'host'
};

/**
 * Will be called whenever the specified event is delivered to the target.
 * [More](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener).
 * @param type TODO
 * @param options TODO
 */
export function Listen(type: string, options?: ListenOptions) {
  return function (target: PlusElement, propertyKey: PropertyKey, descriptor: PropertyDescriptor) {
    options = Object.assign({}, ListenOptionsDefault, options);

    const element = (instance) => {
      switch (options?.target) {
        case 'body':
          return window.document.body;
        case 'document':
          return window.document;
        case 'window':
          return window;
        case 'host':
          return host(instance);
        default:
          return host(instance);
      }
    };

    appendToMethod(target, CONSTANTS.LIFECYCLE_CONNECTED, function () {
      on(element(this), type, this[propertyKey], options);
    });

    appendToMethod(target, CONSTANTS.LIFECYCLE_DISCONNECTED, function () {
      off(element(this), type, this[propertyKey], options);
    });

    return Bind()(target, propertyKey, descriptor);
  };
}
