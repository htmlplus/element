import * as CONSTANTS from '../../constants/index.js';
import { appendToMethod, on, off } from '../utils/index.js';
import { Bind } from './bind.js';
/**
 * Will be called whenever the specified event is delivered to the target
 * [More](https://mdn.io/add-event-listener).
 *
 * @param type A case-sensitive string representing the [Event Type](https://mdn.io/events) to listen for.
 * @param options An object that configures
 * [options](https://developer.mozilla.org/docs/Web/API/EventTarget/addEventListener#options)
 * for the event listener.
 */
export function Listen(type, options) {
    return function (target, key, descriptor) {
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
