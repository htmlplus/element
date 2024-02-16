import { kebabCase, pascalCase } from 'change-case';
import { defineProperty, getConfig, getFramework, host } from '../utils/index.js';
/**
 * Provides the capability to dispatch a [CustomEvent](https://mdn.io/custom-event)
 * from an element.
 *
 * @param options An object that configures options for the event dispatcher.
 */
export function Event(options = {}) {
    return function (target, propertyKey) {
        defineProperty(target, propertyKey, {
            get() {
                return (detail) => {
                    var _a, _b;
                    const element = host(this);
                    const framework = getFramework(element);
                    (_a = options.bubbles) !== null && _a !== void 0 ? _a : (options.bubbles = false);
                    let type = String(propertyKey);
                    switch (framework) {
                        case 'qwik':
                        case 'solid':
                            type = pascalCase(type).toLowerCase();
                            break;
                        case 'preact':
                            type = pascalCase(type);
                            break;
                        default:
                            type = kebabCase(type);
                            break;
                    }
                    let event;
                    event || (event = (_b = getConfig('event', 'resolver')) === null || _b === void 0 ? void 0 : _b({ detail, element, framework, options, type }));
                    event || (event = new CustomEvent(type, Object.assign(Object.assign({}, options), { detail })));
                    element.dispatchEvent(event);
                    return event;
                };
            }
        });
    };
}
