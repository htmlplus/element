import { kebabCase, pascalCase } from 'change-case';
import { defineProperty, getFramework, host } from '../utils/index.js';
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
                    var _a;
                    const element = host(this);
                    const framework = getFramework(element);
                    (_a = options.bubbles) !== null && _a !== void 0 ? _a : (options.bubbles = false);
                    let name = String(propertyKey);
                    switch (framework) {
                        case 'qwik':
                        case 'solid':
                            name = pascalCase(name).toLowerCase();
                            break;
                        case 'preact':
                            name = pascalCase(name);
                            break;
                        default:
                            name = kebabCase(name);
                            break;
                    }
                    const event = new CustomEvent(name, Object.assign(Object.assign({}, options), { detail }));
                    element.dispatchEvent(event);
                    return event;
                };
            }
        });
    };
}
