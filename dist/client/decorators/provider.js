import * as CONSTANTS from '../../constants/index.js';
import { appendToMethod, on } from '../utils/index.js';
/**
 * TODO
 * @param namespace
 */
export function Provider(namespace) {
    return function (target, key, descriptor) {
        const symbol = Symbol();
        const update = (instance) => (updater) => {
            const state = descriptor.get.call(instance);
            const successful = updater(state);
            if (successful)
                return;
            instance[symbol].delete(updater);
        };
        appendToMethod(target, CONSTANTS.LIFECYCLE_CONSTRUCTED, function () {
            this[symbol] || (this[symbol] = new Set());
            const handler = (event) => {
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
