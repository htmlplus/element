import * as CONSTANTS from '../../constants/index.js';
import { HTMLPlusElement } from '../../types';
import { appendToMethod, on } from '../utils/index.js';

/**
 * TODO
 * @param namespace
 */
export function Provider(namespace: string) {
  return function (target: HTMLPlusElement, key: PropertyKey, descriptor: PropertyDescriptor) {
    const symbol = Symbol();

    const update = (instance) => (updater) => {
      const state = descriptor.get!.call(instance);

      const successful = updater(state);

      if (successful) return;

      instance[symbol].delete(updater);
    };

    appendToMethod(target, CONSTANTS.LIFECYCLE_CONSTRUCTED, function () {
      this[symbol] ||= new Set();

      const handler = (event: any) => {
        event.stopPropagation();

        const updater = event.detail;

        this[symbol].add(updater);

        update(this)(updater);
      };

      on(this, `internal:context:${namespace}`, handler);
    });

    appendToMethod(target, CONSTANTS.LIFECYCLE_UPDATED, function () {
      this[symbol].forEach(update(this));
    });
  };
}
