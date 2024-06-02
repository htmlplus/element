import { kebabCase, pascalCase } from 'change-case';

import { HTMLPlusElement } from '../../types/index.js';
import { defineProperty, dispatch, getConfig, getFramework, host } from '../utils/index.js';

/**
 * A function type that generates a `CustomEvent`.
 */
export type EventEmitter<T = any> = (data?: T) => CustomEvent<T>;

/**
 * An object that configures
 * [options](https://developer.mozilla.org/docs/Web/API/Event/EventEvent#options)
 * for the event dispatcher.
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
   * (see [Event.composed](https://mdn.io/event-composed) for more details).
   * The default is `false`.
   */
  composed?: boolean;
}

/**
 * Provides the capability to dispatch a [CustomEvent](https://mdn.io/custom-event)
 * from an element.
 *
 * @param options An object that configures options for the event dispatcher.
 */
export function Event<T = any>(options: EventOptions = {}) {
  return function (target: HTMLPlusElement, key: PropertyKey) {
    defineProperty(target, key, {
      get() {
        return (detail?: T): CustomEvent<T> => {
          const element = host(this);

          const framework = getFramework(this);

          options.bubbles ??= false;

          let type = String(key);

          switch (framework) {
            // TODO: Experimental
            case 'blazor':
              options.bubbles = true;

              type = pascalCase(type);

              try {
                window['Blazor'].registerCustomEventType(type, {
                  createEventArgs: (event) => ({
                    detail: event.detail
                  })
                });
              } catch {}
              break;

            case 'qwik':
            case 'solid':
              type = pascalCase(type).toLowerCase();
              break;

            case 'react':
            case 'preact':
              type = pascalCase(type);
              break;

            default:
              type = kebabCase(type);
              break;
          }

          let event: CustomEvent<T>;

          event ||= getConfig('event', 'resolver')?.({ detail, element, framework, options, type });

          event && element.dispatchEvent(event);

          event ||= dispatch<T>(this, type, { ...options, detail });

          return event;
        };
      }
    });
  };
}
