import { HTMLPlusElement } from '../../types/index.js';
/**
 * A function type that generates a `CustomEvent`.
 */
export type EventEmitter<T = any> = (data?: T) => CustomEvent<T>;
/**
 * An object that configures
 * [options](https://developer.mozilla.org/docs/Web/API/Event/EventEvent#options)
 * for the event dispatcher.
 */
export interface EventOptions {
    /**
     * A boolean value indicating whether the event bubbles.
     * The default is `false`.
     */
    bubbles?: boolean;
    /**
     * A boolean value indicating whether the event can be cancelled.
     * The default is `false`.
     */
    cancelable?: boolean;
    /**
     * A boolean value indicating whether the event will trigger listeners outside of a shadow root
     * (see [Event.composed](https://mdn.io/event-composed) for more details).
     * The default is `false`.
     */
    composed?: boolean;
}
/**
 * Provides the capability to dispatch a [CustomEvent](https://mdn.io/custom-event)
 * from an element.
 *
 * @param options An object that configures options for the event dispatcher.
 */
export declare function Event<T = any>(options?: EventOptions): (target: HTMLPlusElement, key: PropertyKey) => void;
