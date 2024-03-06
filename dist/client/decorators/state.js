import { defineProperty, request } from '../utils/index.js';
/**
 * Applying this decorator to any `class property` will trigger the
 * element to re-render upon the desired property changes.
 */
export function State() {
    return function (target, key) {
        const name = String(key);
        const symbol = Symbol();
        function get() {
            return this[symbol];
        }
        function set(next) {
            const previous = this[symbol];
            if (next === previous)
                return;
            this[symbol] = next;
            request(this, name, previous);
        }
        // TODO: configurable
        defineProperty(target, key, { get, set, configurable: true });
    };
}
