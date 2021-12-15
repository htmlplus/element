import * as Helpers from '../helpers/index.js';
import { EventOptions } from '../types/index.js';

export type EventEmitter<T = any> = (data?: T) => CustomEvent<T>;

export function Event<T = any>(options: EventOptions = {}) {

    return function (target: Object, propertyKey: PropertyKey) {

        const descriptor = {
            get() {
                return (data?: T): CustomEvent<T> => {

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