import { HTMLPlusElement } from '../../types';
/**
 * TODO
 */
export declare const dispatch: <T = any>(target: HTMLElement | HTMLPlusElement, type: string, eventInitDict?: CustomEventInit<T> | undefined) => CustomEvent<T>;
/**
 * TODO
 */
export declare const on: (target: Window | Document | HTMLElement | HTMLPlusElement, type: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => void;
/**
 * TODO
 */
export declare const off: (target: Window | Document | HTMLElement | HTMLPlusElement, type: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => void;
