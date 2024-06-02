import * as CONSTANTS from '../../constants/index.js';
import { HTMLPlusElement } from '../../types/index.js';
import { appendToMethod, on, off } from '../utils/index.js';
import { Bind } from './bind.js';

/**
 * An object that configures
 * [options](https://developer.mozilla.org/docs/Web/API/EventTarget/addEventListener#options)
 * for the event listener.
 */
export interface ListenOptions {
  /**
   * A boolean value indicating that events of this type will be dispatched to the registered
   * `listener` before being dispatched to any `EventTarget` beneath it in the DOM tree.
   * If not specified, defaults to `false`.
   */
  capture?: boolean;
  /**
   * A boolean value indicating that the `listener` should be invoked at most once after being added.
   * If `true`, the `listener` would be automatically removed when invoked.
   * If not specified, defaults to `false`.
   */
  once?: boolean;
  /**
   * A boolean value that, if `true`,
   * indicates that the function specified by `listener` will never call
   * [preventDefault()](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault).
   * If a passive listener does call `preventDefault()`,
   * the user agent will do nothing other than generate a console warning.
   */
  passive?: boolean;
  /**
   * An [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
   * The listener will be removed when the given `AbortSignal` object's
   * [abort()](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) method is called.
   * If not specified, no `AbortSignal` is associated with the listener.
   */
  signal?: AbortSignal;
  /**
   * The target element, defaults to `host`.
   */
  target?: 'host' | 'body' | 'document' | 'window';
}

/**
 * Will be called whenever the specified event is delivered to the target
 * [More](https://mdn.io/add-event-listener).
 *
 * @param type A case-sensitive string representing the [Event Type](https://mdn.io/events) to listen for.
 * @param options An object that configures
 * [options](https://developer.mozilla.org/docs/Web/API/EventTarget/addEventListener#options)
 * for the event listener.
 */
export function Listen(type: string, options?: ListenOptions) {
  return function (target: HTMLPlusElement, key: PropertyKey, descriptor: PropertyDescriptor) {
    const element = (instance) => {
      switch (options?.target) {
        case 'body':
          return window.document.body;
        case 'document':
          return window.document;
        case 'window':
          return window;
        case 'host':
          return instance;
        default:
          return instance;
      }
    };

    appendToMethod(target, CONSTANTS.LIFECYCLE_CONNECTED, function () {
      on(element(this), type, this[key], options);
    });

    appendToMethod(target, CONSTANTS.LIFECYCLE_DISCONNECTED, function () {
      off(element(this), type, this[key], options);
    });

    return Bind()(target, key, descriptor);
  };
}
