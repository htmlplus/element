import * as CONSTANTS from '../../constants/index.js';
import { appendToMethod } from '../utils/index.js';
/**
 * Monitors `@Property` and `@State` to catch changes.
 * The decorated method will be invoked after any
 * changes with the `key`, `newValue`, and `oldValue` as parameters.
 * If the arguments aren't defined, all of the `@Property` and `@State` are considered.
 * @param keys Collection of `@Property` and `@State` names.
 * @param immediate Triggers the callback immediately after initialization.
 */
export function Watch(keys, immediate) {
    return function (target, propertyKey) {
        // Gets all keys
        const all = [keys].flat().filter((key) => key);
        // Registers a lifecycle to detect changes.
        appendToMethod(target, CONSTANTS.LIFECYCLE_UPDATED, function (states) {
            // Skips the logic if 'immediate' wasn't passed.
            if (!immediate && !this[CONSTANTS.API_RENDER_COMPLETED])
                return;
            // Loops the keys.
            states.forEach((previous, key) => {
                // Skips the current key.
                if (all.length && !all.includes(key))
                    return;
                // Invokes the method with parameters.
                this[propertyKey](this[key], previous, key);
            });
        });
    };
}