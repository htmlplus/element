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
                    const element = host(this);
                    const framework = getFramework(this);
                    options.bubbles ??= false;
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
                            catch { }
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
                    event ||= getConfig('event', 'resolver')?.({ detail, element, framework, options, type });
                    event && element.dispatchEvent(event);
                    event ||= dispatch(this, type, { ...options, detail });
                    return event;
                };
            }
        });
    };
}
