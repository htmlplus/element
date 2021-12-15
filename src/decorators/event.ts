import * as Helpers from '../helpers/index.js';

export type EventEmitter<T = any> = (data?: T) => CustomEvent<T>;

export interface EventOptions {
    /**
     * A string custom event name to override the default.
     */
    name?: string;
    /**
     * A Boolean indicating whether the event bubbles up through the DOM or not.
     */
    bubbles?: boolean;
    /**
     * A Boolean indicating whether the event is cancelable.
     */
    cancelable?: boolean;
    /**
     * A Boolean value indicating whether or not the event can bubble across the boundary between the shadow DOM and the regular DOM.
     */
    composed?: boolean;
}

export function Event<T = any>(options: EventOptions = {}) {

    return function (target: Object, propertyKey: PropertyKey) {

        const config = options;

        const descriptor = {
            get() {
                return (data?: T, options?: EventOptions): CustomEvent<T> => {

                    options = Object.assign({}, config, options);

                    const name = options.name || String(propertyKey);

                    delete options.name;

                    const event = new CustomEvent(
                        name,
                        {
                            ...options,
                            detail: data
                        }
                    )

                    // TODO: add global hook
                    Helpers.host(this).dispatchEvent(event);

                    return event;
                }
            }
        }

        Object.defineProperty(target, propertyKey, descriptor);
    }
}