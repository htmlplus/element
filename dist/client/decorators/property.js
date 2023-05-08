import * as CONSTANTS from '../../constants/index.js';
import { addMember, appendToMethod, defineProperty, host, request, updateAttribute } from '../utils/index.js';
export function Property(options) {
    return function (target, propertyKey) {
        const name = String(propertyKey);
        const symbol = Symbol();
        addMember(target.constructor, name, options);
        function get() {
            return this[symbol];
        }
        function set(next) {
            const previous = this[symbol];
            if (next === previous)
                return;
            this[symbol] = next;
            request(this, name, previous, (skipped) => {
                if (!(options === null || options === void 0 ? void 0 : options.reflect) || skipped)
                    return;
                target[CONSTANTS.API_LOCKED] = true;
                updateAttribute(host(this), name, next);
                target[CONSTANTS.API_LOCKED] = false;
            });
        }
        defineProperty(target, propertyKey, { get, set });
        appendToMethod(target, CONSTANTS.LIFECYCLE_CONNECTED, function () {
            const element = host(this);
            // TODO: experimental for isolated options
            if (element === this)
                return;
            const get = () => {
                return this[propertyKey];
            };
            const set = (input) => {
                this[propertyKey] = input;
            };
            // TODO: configurable
            defineProperty(element, propertyKey, { get, set, configurable: true });
        });
    };
}
