/**
 * Used to bind a method of a class to the current context,
 * making it easier to reference `this` within the method.
 */
declare function Bind(): (_target: object, key: PropertyKey, descriptor: PropertyDescriptor) => {
    configurable: boolean;
    get(): any;
};

interface HTMLPlusElement {
}

declare function Provider(namespace: string): (target: HTMLPlusElement, key: PropertyKey) => void;
declare function Consumer(namespace: string): (target: HTMLPlusElement, key: PropertyKey) => void;

/**
 * A method decorator that applies debounce behavior to a class method.
 * Ensures that the method executes only after the specified delay,
 * resetting the timer if called again within the delay period.
 *
 * @param {number} delay - The debounce delay in milliseconds.
 */
declare function Debounce(delay?: number): (target: object, key: PropertyKey, descriptor: PropertyDescriptor) => {
    configurable: boolean;
    get(): any;
};

/**
 * Indicates whether the [Direction](https://mdn.io/css-direction)
 * of the element is `Right-To-Left` or `Left-To-Right`.
 */
declare function Direction$1(): (target: HTMLPlusElement, key: PropertyKey) => void;

/**
 * The class marked with this decorator is considered a
 * [Custom Element](https://mdn.io/using-custom-elements),
 * and its name, in kebab-case, serves as the element name.
 */
declare function Element$1(): (constructor: HTMLPlusElement) => void;

/**
 * A function type that generates a `CustomEvent`.
 */
type EventEmitter<T = unknown> = (data?: T) => CustomEvent<T>;
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
declare function Event<T = unknown>(options?: EventOptions): (target: HTMLPlusElement, key: PropertyKey) => void;

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
declare function Method(): (target: HTMLPlusElement, key: PropertyKey, _descriptor: PropertyDescriptor) => void;

type OverridesConfig<Breakpoint extends string, Properties = unknown> = {
    [Key in Breakpoint]?: Partial<Properties>;
};
declare function Overrides(): (target: HTMLPlusElement, key: string) => void;

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
    type?: unknown;
}
/**
 * Creates a reactive property, reflecting a corresponding attribute value,
 * and updates the element when the property is set.
 */
declare function Property(options?: PropertyOptions): (target: HTMLPlusElement, key: string, descriptor?: PropertyDescriptor) => void;

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

declare function Style(): (target: HTMLPlusElement, key: PropertyKey) => void;

declare function Variant(): (target: HTMLPlusElement, key: string) => void;

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
declare const classes: (input: unknown, smart?: boolean) => string;

/**
 * TODO
 */
interface Config {
    breakpoints?: {
        [key: string]: {
            type: 'container' | 'media';
            min?: number;
            max?: number;
        };
    };
    event?: {
        resolver?: (parameters: unknown) => CustomEvent | undefined;
    };
    assets?: {
        [key: string]: unknown;
    };
    elements?: {
        [key: string]: {
            properties?: {
                [key: string]: {
                    default?: unknown;
                };
            };
            variants?: {
                [key: string]: {
                    properties: {
                        [key: string]: unknown;
                    };
                };
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
declare const getConfig: (namespace: string) => Config;
/**
 * TODO
 */
declare const getConfigCreator: (namespace: string) => () => Config;
/**
 * TODO
 */
declare const setConfig: (namespace: string, config: Config, options?: ConfigOptions) => void;
/**
 * TODO
 */
declare const setConfigCreator: (namespace: string) => (config: Config, options?: ConfigOptions) => void;

type Direction = 'ltr' | 'rtl';
/**
 * Indicates whether the [Direction](https://mdn.io/css-direction)
 * of the element is `Right-To-Left` or `Left-To-Right`.
 */
declare const direction: (target: HTMLElement | HTMLPlusElement) => Direction;

/**
 * TODO
 */
declare const dispatch: <T = unknown>(target: HTMLElement | HTMLPlusElement, type: string, eventInitDict?: CustomEventInit<T>) => CustomEvent<T>;
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

declare const toCSSColor: (input: string) => string | undefined;

declare const toCSSUnit: (input?: number | string | null) => string | undefined;

/**
 * Converts a value to a unit.
 */
declare const toUnit: (input: string | number, unit?: string) => string;

/**
 * Holds all details wrappers needed to render the content further on.
 * @constructor
 * @param {string} type The hole type, either `html` or `svg`.
 * @param {string[]} template The template literals used to the define the content.
 * @param {Array} values Zero, one, or more interpolated values to render.
 */
declare class Hole {
    constructor(type: any, template: any, values: any);
    type: any;
    template: any;
    values: any;
}

type OverridableValue<Base, Overrides = unknown> = Exclude<Base, {
    [K in keyof Overrides]: Overrides[K] extends false ? K : never;
}[keyof Overrides]> | {
    [K in keyof Overrides]: Overrides[K] extends true ? K : never;
}[keyof Overrides];

declare const attributes: (target: HTMLElement | HTMLPlusElement, attributes: unknown[]) => void;
declare const html: ((template: any, ...values: any[]) => Hole) & {
    for(ref: any, id: any): any;
    node: (template: any, ...values: any[]) => any;
};
declare const styles: (input: object) => string;

export { Bind, Consumer, Debounce, Direction$1 as Direction, Element$1 as Element, Event, Host, IsRTL, Listen, Method, Overrides, Property, Provider, Query, QueryAll, Slots$1 as Slots, State, Style, Variant, Watch, attributes as a, classes, direction, dispatch, getConfig, getConfigCreator, html as h, host, isCSSColor, isRTL, off, on, query, queryAll, styles as s, setConfig, setConfigCreator, slots, toCSSColor, toCSSUnit, toUnit };
export type { Config, ConfigOptions, EventEmitter, EventOptions, ListenOptions, OverridableValue, OverridesConfig, PropertyOptions };
