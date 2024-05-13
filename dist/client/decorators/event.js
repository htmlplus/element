import { kebabCase, pascalCase } from 'change-case';
import { defineProperty, dispatch, getConfig, getFramework, host } from '../utils/index.js';
/**
 * Provides the capability to dispatch a [CustomEvent](https://mdn.io/custom-event)
 * from an element.
 *
 * @param options An object that configures options for the event dispatcher.
 */
export function Event(options = {}) {
    return function (target, key) {
        defineProperty(target, key, {
            get() {
                return (detail) => {
                    var _a, _b;
                    const element = host(this);
                    const framework = getFramework(this);
                    (_a = options.bubbles) !== null && _a !== void 0 ? _a : (options.bubbles = false);
                    let type = String(key);
                    switch (framework) {
                        // TODO: Experimental
                        case 'blazor':
                            options.bubbles = true;
                            type = pascalCase(type);
                            try {
                                window['Blazor'].registerCustomEventType(type, {
                                    createEventArgs: (event) => ({
                                        detail: event.detail
                                    })
                                });
                            }
                            catch (_c) { }
                            break;
                        case 'qwik':
                        case 'solid':
                            type = pascalCase(type).toLowerCase();
                            break;
                        case 'react':
                        case 'preact':
                            type = pascalCase(type);
                            break;
                        default:
                            type = kebabCase(type);
                            break;
                    }
                    let event;
                    event || (event = (_b = getConfig('event', 'resolver')) === null || _b === void 0 ? void 0 : _b({ detail, element, framework, options, type }));
                    event && element.dispatchEvent(event);
                    event || (event = dispatch(this, type, Object.assign(Object.assign({}, options), { detail })));
                    return event;
                };
            }
        });
    };
}
