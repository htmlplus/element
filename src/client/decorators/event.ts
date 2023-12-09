import { kebabCase, pascalCase } from 'change-case';

import { PlusElement } from '../../types';
import { defineProperty, getFramework, host } from '../utils/index.js';

/**
 * A function type that generates a `CustomEvent`.
 */
export type EventEmitter<T = any> = (data?: T) => CustomEvent<T>;

/**
 * An object value indicating whether the event's
 * [options](https://developer.mozilla.org/docs/Web/API/Event/Event#options).
 */
export interface EventOptions {
  /**
   * A boolean value indicating whether the event bubbles.
   * The default is `false`.
   */
  bubbles?: boolean;
  /**
   * A boolean value indicating whether the event can be cancelled.
   * The default is `false`.
   */
  cancelable?: boolean;
  /**
   * A boolean value indicating whether the event will trigger listeners outside of a shadow root
   * (see [Event.composed](https://developer.mozilla.org/docs/Web/API/Event/composed) for more details).
   * The default is `false`.
   */
  composed?: boolean;
}

/**
 * Provides the capability to dispatch a
 * [CustomEvent](https://developer.mozilla.org/docs/Web/API/CustomEvent/CustomEvent).
 *
 * @param options An object value indicating whether the event's options.
 */
export function Event<T = any>(options: EventOptions = {}) {
  return function (target: PlusElement, propertyKey: PropertyKey) {
    defineProperty(target, propertyKey, {
      get() {
        return (detail?: T): CustomEvent<T> => {
          const element = host(this);

          const framework = getFramework(element);

          options.bubbles ??= false;

          let name = String(propertyKey);

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
