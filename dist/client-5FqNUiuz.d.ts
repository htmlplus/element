/**
 * Used to bind a method of a class to the current context,
 * making it easier to reference `this` within the method.
 */
declare function Bind(): (target: Object, key: PropertyKey, descriptor: PropertyDescriptor) => {
    configurable: boolean;
    get(): any;
};

interface HTMLPlusElement {
}

declare function Provider(namespace: string): (target: HTMLPlusElement, key: PropertyKey, descriptor: PropertyDescriptor) => void;
declare function Consumer(namespace: string): (target: HTMLPlusElement, key: PropertyKey) => void;

/**
 * Indicates whether the [Direction](https://mdn.io/css-direction)
 * of the element is `Right-To-Left` or `Left-To-Right`.
 */
declare function Direction(): (target: HTMLPlusElement, key: PropertyKey) => void;

/**
 * The class marked with this decorator is considered a
 * [Custom Element](https://mdn.io/using-custom-elements),
 * and its name, in kebab-case, serves as the element name.
 */
declare function Element$1(): (constructor: HTMLPlusElement) => void;

/**
 * A function type that generates a `CustomEvent`.
 */
type EventEmitter<T = any> = (data?: T) => CustomEvent<T>;
/**
 * An object that configures
 * [options](https://developer.mozilla.org/docs/Web/API/Event/EventEvent#options)
 * for the event dispatcher.
 */
interface EventOptions {
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
declare function Event<T = any>(options?: EventOptions): (target: HTMLPlusElement, key: PropertyKey) => void;

/**
 * Indicates the host of the element.
 */
declare function Host(): (target: HTMLPlusElement, key: PropertyKey) => void;

/**
 * Indicates whether the direction of the element is `Right-To-Left` or not.
 */
declare function IsRTL(): (target: HTMLPlusElement, key: PropertyKey) => void;

/**
 * An object that configures
 * [options](https://developer.mozilla.org/docs/Web/API/EventTarget/addEventListener#options)
 * for the event listener.
 */
interface ListenOptions {
    /**
     * A boolean value indicating that events of this type will be dispatched to the registered
     * `listener` before being dispatched to any `EventTarget` beneath it in the DOM tree.
     * If not specified, defaults to `false`.
     */
    capture?: boolean;
    /**
     * A boolean value indicating that the `listener` should be invoked at most once after being added.
     * If `true`, the `listener` would be automatically removed when invoked.
     * If not specified, defaults to `false`.
     */
    once?: boolean;
    /**
     * A boolean value that, if `true`,
     * indicates that the function specified by `listener` will never call
     * [preventDefault()](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault).
     * If a passive listener does call `preventDefault()`,
     * the user agent will do nothing other than generate a console warning.
     */
    passive?: boolean;
    /**
     * An [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
     * The listener will be removed when the given `AbortSignal` object's
     * [abort()](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort) method is called.
     * If not specified, no `AbortSignal` is associated with the listener.
     */
    signal?: AbortSignal;
    /**
     * The target element, defaults to `host`.
     */
    target?: 'host' | 'body' | 'document' | 'window';
}
/**
 * Will be called whenever the specified event is delivered to the target
 * [More](https://mdn.io/add-event-listener).
 *
 * @param type A case-sensitive string representing the [Event Type](https://mdn.io/events) to listen for.
 * @param options An object that configures
 * [options](https://developer.mozilla.org/docs/Web/API/EventTarget/addEventListener#options)
 * for the event listener.
 */
declare function Listen(type: string, options?: ListenOptions): (target: HTMLPlusElement, key: PropertyKey, descriptor: PropertyDescriptor) => {
    configurable: boolean;
    get(): any;
};

/**
 * Provides a way to encapsulate functionality within an element
 * and invoke it as needed, both internally and externally.
 */
declare function Method(): (target: HTMLPlusElement, key: PropertyKey) => void;

/**
 * The configuration for property decorator.
 */
interface PropertyOptions {
    /**
     * Specifies the name of the attribute related to the property.
     */
    attribute?: string;
    /**
     * Whether property value is reflected back to the associated attribute. default is `false`.
     */
    reflect?: boolean;
    /**
     * Specifies the property `type` and supports
     * [data types](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures).
     * If this value is not set, it will be set automatically during transforming.
     */
    type?: any;
}
/**
 * Creates a reactive property, reflecting a corresponding attribute value,
 * and updates the element when the property is set.
 */
declare function Property(options?: PropertyOptions): (target: HTMLPlusElement, key: PropertyKey, descriptor?: PropertyDescriptor) => void;

/**
 * Selects the first element in the shadow dom that matches a specified CSS selector.
 *
 * @param selectors A string containing one or more selectors to match.
 * This string must be a valid CSS selector string; if it isn't, a `SyntaxError` exception is thrown. See
 * [Locating DOM elements using selectors](https://developer.mozilla.org/en-US/docs/Web/API/Document_object_model/Locating_DOM_elements_using_selectors)
 * for more about selectors and how to manage them.
 */
declare function Query(selectors: string): (target: HTMLPlusElement, key: PropertyKey) => void;

/**
 * Selects all elements in the shadow dom that match a specified CSS selector.
 *
 * @param selectors A string containing one or more selectors to match against.
 * This string must be a valid
 * [CSS selector](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_selectors)
 * string; if it's not, a `SyntaxError` exception is thrown. See
 * [Locating DOM elements using selectors](https://developer.mozilla.org/en-US/docs/Web/API/Document_object_model/Locating_DOM_elements_using_selectors)
 * for more information about using selectors to identify elements.
 * Multiple selectors may be specified by separating them using commas.
 */
declare function QueryAll(selectors: string): (target: HTMLPlusElement, key: PropertyKey) => void;

/**
 * Returns the slots name.
 */
declare function Slots$1(): (target: HTMLPlusElement, key: PropertyKey) => void;

/**
 * Applying this decorator to any `class property` will trigger the
 * element to re-render upon the desired property changes.
 */
declare function State(): (target: HTMLPlusElement, key: PropertyKey) => void;

/**
 * Monitors `@Property` and `@State` to detect changes.
 * The decorated method will be called after any changes,
 * with the `key`, `newValue`, and `oldValue` as parameters.
 * If the `key` is not defined, all `@Property` and `@State` are considered.
 *
 * @param keys Collection of `@Property` and `@State` names.
 * @param immediate Triggers the callback immediately after initialization.
 */
declare function Watch(keys?: string | string[], immediate?: boolean): (target: HTMLPlusElement, key: PropertyKey) => void;

/**
 * TODO
 */
declare const classes: (input: any, smart?: boolean) => string;

/**
 * TODO
 */
interface Config {
    event?: {
        resolver?: (parameters: any) => CustomEvent | undefined;
    };
    asset?: {
        [key: string]: any;
    };
    element?: {
        [key: string]: {
            property?: {
                [key: string]: any;
            };
        };
    };
}
/**
 * TODO
 */
interface ConfigOptions {
    /**
     * TODO
     */
    force?: boolean;
    /**
     * TODO
     */
    override?: boolean;
}
/**
 * TODO
 */
declare const getConfig: (...keys: string[]) => any;
/**
 * TODO
 */
declare const setConfig: (config: Config, options?: ConfigOptions) => void;

/**
 * Indicates whether the [Direction](https://mdn.io/css-direction)
 * of the element is `Right-To-Left` or `Left-To-Right`.
 */
declare const direction: (target: HTMLElement | HTMLPlusElement) => "ltr" | "rtl";

/**
 * TODO
 */
declare const dispatch: <T = any>(target: HTMLElement | HTMLPlusElement, type: string, eventInitDict?: CustomEventInit<T>) => CustomEvent<T>;
/**
 * TODO
 */
declare const on: (target: Window | Document | HTMLElement | HTMLPlusElement, type: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => void;
/**
 * TODO
 */
declare const off: (target: Window | Document | HTMLElement | HTMLPlusElement, type: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => void;

/**
 * Indicates the host of the element.
 */
declare const host: (target: HTMLElement | HTMLPlusElement) => HTMLElement;

/**
 * Determines whether the given input string is a valid
 * [CSS Color](https://mdn.io/color-value) or not.
 */
declare const isCSSColor: (input: string) => boolean;

/**
 * Indicates whether the direction of the element is `Right-To-Left` or not.
 */
declare const isRTL: (target: HTMLPlusElement) => boolean;

/**
 * Selects the first element in the shadow dom that matches a specified CSS selector.
 */
declare function query(target: HTMLPlusElement, selectors: string): Element | null | undefined;

/**
 * Selects all elements in the shadow dom that match a specified CSS selector.
 */
declare function queryAll(target: HTMLPlusElement, selectors: string): NodeListOf<Element> | undefined;

type Slots = {
    [key: string]: boolean;
};
/**
 * Returns the slots name.
 */
declare const slots: (target: HTMLElement | HTMLPlusElement) => Slots;

/**
 * Converts a value to a unit.
 */
declare const toUnit: (input: string | number, unit?: string) => string;

declare const attributes: any;
declare const html: any;
declare const styles: any;

export { styles as A, Bind as B, type Config as C, Direction as D, Element$1 as E, Host as H, IsRTL as I, type ListenOptions as L, Method as M, Provider as P, Query as Q, Slots$1 as S, Watch as W, dispatch as a, isRTL as b, classes as c, direction as d, queryAll as e, off as f, getConfig as g, host as h, isCSSColor as i, setConfig as j, type ConfigOptions as k, Consumer as l, type EventEmitter as m, type EventOptions as n, on as o, Event as p, query as q, Listen as r, slots as s, toUnit as t, type PropertyOptions as u, Property as v, QueryAll as w, State as x, attributes as y, html as z };
