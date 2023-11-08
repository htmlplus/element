import { kebabCase, pascalCase } from 'change-case';

import { PlusElement } from '../../types';
import { defineProperty, getFramework, host } from '../utils/index.js';

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

export function Event<T = any>(options: EventOptions = {}) {
  return function (target: PlusElement, propertyKey: PropertyKey) {
    defineProperty(target, propertyKey, {
      get() {
        return (detail?: T): CustomEvent<T> => {
          const element = host(this);

          const framework = getFramework(element);

          options.bubbles ??= false;

          let name = options.name || String(propertyKey);

          switch (framework) {
            case 'qwik':
            case 'solid':
              name = pascalCase(name).toLowerCase();
              break;
            case 'preact':
            case 'react':
              name = pascalCase(name);
              break;
            default:
              name = kebabCase(name);
              break;
          }

          const event = new CustomEvent(name, { ...options, detail });

          element.dispatchEvent(event);

          return event;
        };
      }
    });
  };
}
