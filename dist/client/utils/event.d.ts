type EventTarget = Window | Document | Element;
type EventType = 'outside' | (string & {});
type EventHandler = EventListenerOrEventListenerObject;
type EventOptions = boolean | AddEventListenerOptions;
type EventListener = (target: EventTarget, type: EventType, handler: EventHandler, options?: EventOptions) => void;
/**
 * TODO
 */
export declare const off: EventListener;
/**
 * TODO
 */
export declare const on: EventListener;
export {};
