import { PlusElement } from '../../types/index.js';
import { defineProperty, host } from '../utils/index.js';

export type EventEmitter<T = any> = (data?: T) => CustomEvent<T>;

export interface EventOptions {
  /**
   * A string custom event name to override the default.
   */
  name?: string;
  /**
   * A Boolean indicating whether the event bubbles up through the DOM or not. default is `false`.
   */
  bubbles?: boolean;
  /**
   * A Boolean indicating whether the event is cancelable. default is `false`.
   */
  cancelable?: boolean;
  /**
   * A Boolean value indicating whether or not the event can bubble across the boundary between the shadow DOM and the regular DOM. The default is false.
   */
  composed?: boolean;
}

// TODO: add global hook
export function Event<T = any>(options: EventOptions = {}) {
  return function (target: PlusElement, propertyKey: PropertyKey) {
    defineProperty(target, propertyKey, {
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
