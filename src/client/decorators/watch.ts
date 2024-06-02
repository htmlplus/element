import * as CONSTANTS from '../../constants/index.js';
import { HTMLPlusElement } from '../../types/index.js';
import { appendToMethod } from '../utils/index.js';

/**
 * Monitors `@Property` and `@State` to detect changes.
 * The decorated method will be called after any changes,
 * with the `key`, `newValue`, and `oldValue` as parameters.
 * If the `key` is not defined, all `@Property` and `@State` are considered.
 *
 * @param keys Collection of `@Property` and `@State` names.
 * @param immediate Triggers the callback immediately after initialization.
 */
export function Watch(keys?: string | string[], immediate?: boolean) {
  return function (target: HTMLPlusElement, key: PropertyKey): void {
    // Gets all keys
    const all = [keys].flat().filter((item) => item);
    // Registers a lifecycle to detect changes.
    appendToMethod(target, CONSTANTS.LIFECYCLE_UPDATED, function (states: Map<string, any>) {
      // Skips the logic if 'immediate' wasn't passed.
      if (!immediate && !this[CONSTANTS.API_RENDER_COMPLETED]) return;
      // Loops the keys.
      states.forEach((previous, item) => {
        // Skips the current key.
        if (all.length && !all.includes(item)) return;
        // Invokes the method with parameters.
        this[key](this[item], previous, item);
      });
    });
  };
}
