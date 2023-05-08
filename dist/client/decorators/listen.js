import * as CONSTANTS from '../../constants/index.js';
import { appendToMethod, host, on, off } from '../utils/index.js';
import { Bind } from './bind.js';
/**
 * The default options.
 */
export const ListenOptionsDefault = {
    target: 'host'
};
/**
 * Will be called whenever the specified event is delivered to the target.
 * [More](https://mdn.io/addEventListener).
 * @param type A case-sensitive string representing the [event type](https://mdn.io/events) to listen for.
 * @param options An object that specifies characteristics about the event listener.
 */
export function Listen(type, options) {
    return function (target, propertyKey, descriptor) {
        options = Object.assign({}, ListenOptionsDefault, options);
        const element = (instance) => {
            switch (options === null || options === void 0 ? void 0 : options.target) {
                case 'body':
                    return window.document.body;
                case 'document':
                    return window.document;
                case 'window':
                    return window;
                case 'host':
                    return host(instance);
                default:
                    return host(instance);
            }
        };
        appendToMethod(target, CONSTANTS.LIFECYCLE_CONNECTED, function () {
            on(element(this), type, this[propertyKey], options);
        });
        appendToMethod(target, CONSTANTS.LIFECYCLE_DISCONNECTED, function () {
            off(element(this), type, this[propertyKey], options);
        });
        return Bind()(target, propertyKey, descriptor);
    };
}
