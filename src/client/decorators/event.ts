import { EventOptions, PlusElement } from '../../types/index.js';
import { host } from '../helpers/index.js';

export type EventEmitter<T = any> = (data?: T) => CustomEvent<T>;

// TODO: add global hook
export function Event<T = any>(options: EventOptions = {}) {
  return function (target: PlusElement, propertyKey: PropertyKey) {
    Object.defineProperty(target, propertyKey, {
      get() {
        return (detail?: T): CustomEvent<T> => {
          options.bubbles ??= false;
          const name = options.name || String(propertyKey);
          const event = new CustomEvent(name, { ...options, detail });
          host(this).dispatchEvent(event);
          return event;
        };
      }
    });
  };
}
