import { PlusElement } from '../../types';
export interface ListenOptions {
    capture?: boolean;
    once?: boolean;
    passive?: boolean;
    signal?: AbortSignal;
    target?: 'host' | 'body' | 'document' | 'window';
}
/**
 * The default options.
 */
export declare const ListenOptionsDefault: ListenOptions;
/**
 * Will be called whenever the specified event is delivered to the target.
 * [More](https://mdn.io/addEventListener).
 * @param type A case-sensitive string representing the [event type](https://mdn.io/events) to listen for.
 * @param options An object that specifies characteristics about the event listener.
 */
export declare function Listen(type: string, options?: ListenOptions): (target: PlusElement, propertyKey: PropertyKey, descriptor: PropertyDescriptor) => {
    configurable: boolean;
    get(): any;
};
