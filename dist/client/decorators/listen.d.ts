import { PlusElement } from '../../types';
/**
 * An object that configures
 * [options](https://developer.mozilla.org/docs/Web/API/EventTarget/addEventListener#options)
 * for the event listener.
 */
export interface ListenOptions {
    capture?: boolean;
    once?: boolean;
    passive?: boolean;
    signal?: AbortSignal;
    target?: 'host' | 'body' | 'document' | 'window';
}
/**
 * Will be called whenever the specified event is delivered to the target
 * [More](https://mdn.io/add-event-listener).
 *
 * @param type A case-sensitive string representing the [Event Type](https://mdn.io/events) to listen for.
 * @param options An object that configures options for the event listener.
 */
export declare function Listen(type: string, options?: ListenOptions): (target: PlusElement, propertyKey: PropertyKey, descriptor: PropertyDescriptor) => {
    configurable: boolean;
    get(): any;
};
