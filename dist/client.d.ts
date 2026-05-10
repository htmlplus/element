/**
 * Used to bind a method of a class to the current context,
 * making it easier to reference `this` within the method.
 */
export declare function Bind(): (_target: object, key: PropertyKey, descriptor: PropertyDescriptor) => {
    configurable: boolean;
    get(): any;
};

declare type BreakpointConfig = {
    type: 'container' | 'media';
    min?: number;
    max?: number;
};

/**
 * TODO
 */
export declare const classes: (input: unknown, smart?: boolean) => string;

/**
 * TODO
 */
export declare type Config<Namespace extends string, Breakpoints extends string> = {
    breakpoints?: {
        [key in Breakpoints]: BreakpointConfig;
    };
    event?: {
        resolver?: (parameters: unknown) => CustomEvent | undefined;
    };
    assets?: {
        [key: string]: unknown;
    };
    elements?: {
        [K in keyof HTMLPlusElements as K extends `${Namespace}-${string}` ? K : never]?: {
            properties?: {
                [Prop in keyof HTMLPlusElements[K]['properties']]?: {
                    default?: HTMLPlusElements[K]['properties'][Prop];
                };
            };
            variants?: {
                [M in HTMLPlusElements[K]['properties']['variant']]?: {
                    properties?: Partial<Omit<HTMLPlusElements[K]['properties'], 'variant'>>;
                };
            };
        };
    };
};

/**
 * TODO
 */
export declare type ConfigOptions = {
    /**
     * TODO
     */
    force?: boolean;
    /**
     * TODO
     */
    override?: boolean;
};

export declare function Consumer(namespace: string): (target: HTMLPlusElement, key: PropertyKey) => void;

/**
 * A method decorator that applies debounce behavior to a class method.
 * Ensures that the method executes only after the specified delay,
 * resetting the timer if called again within the delay period.
 *
 * @param {number} delay - The debounce delay in milliseconds.
 */
export declare function Debounce(delay?: number): (target: object, key: PropertyKey, descriptor: PropertyDescriptor) => {
    configurable: boolean;
    get(): any;
};

/**
 * Indicates whether the [Direction](https://mdn.io/css-direction)
 * of the element is `Right-To-Left` or `Left-To-Right`.
 */
export declare function Direction(): (target: HTMLPlusElement, key: PropertyKey) => void;

/**
 * Indicates whether the [Direction](https://mdn.io/css-direction)
 * of the element is `Right-To-Left` or `Left-To-Right`.
 */
export declare const direction: (target: HTMLElement | HTMLPlusElement) => Direction_2;

declare type Direction_2 = 'ltr' | 'rtl';

/**
 * TODO
 */
export declare const dispatch: <T = unknown>(target: HTMLElement | HTMLPlusElement, type: string, eventInitDict?: CustomEventInit<T>) => CustomEvent<T>;

/**
 * The class marked with this decorator is considered a
 * [Custom Element](https://mdn.io/using-custom-elements),
 * and its name, in kebab-case, serves as the element name.
 */
declare function Element_2(): (constructor: HTMLPlusElement) => void;
export { Element_2 as Element }

/**
 * Provides the capability to dispatch a [CustomEvent](https://mdn.io/custom-event)
 * from an element.
 *
 * @param options An object that configures options for the event dispatcher.
 */
declare function Event_2<T = unknown>(options?: EventOptions): (target: HTMLPlusElement, key: PropertyKey) => void;
export { Event_2 as Event }

/**
 * A function type that generates a `CustomEvent`.
 */
export declare type EventEmitter<T = unknown> = (data?: T) => CustomEvent<T>;

/**
 * An object that configures
 * [options](https://developer.mozilla.org/docs/Web/API/Event/EventEvent#options)
 * for the event dispatcher.
 */
export declare interface EventOptions {
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
 * TODO
 */
export declare const getConfig: <N extends string, B extends string>(namespace: N) => Config<N, B>;

/**
 * TODO
 */
export declare const getConfigCreator: <N extends string, B extends string>(namespace: N) => () => Config<N, B>;

/**
 * Indicates the host of the element.
 */
export declare function Host(): (target: HTMLPlusElement, key: PropertyKey) => void;

/**
 * Indicates the host of the element.
 */
export declare const host: (target: HTMLElement | HTMLPlusElement) => HTMLElement;

declare interface HTMLPlusElement {
}

export declare interface HTMLPlusElements {
}

/**
 * Determines whether the given input string is a valid
 * [CSS Color](https://mdn.io/color-value) or not.
 */
export declare const isCSSColor: (input: string) => boolean;

export declare const isCSSUnit: (input: string) => boolean;

/**
 * Indicates whether the direction of the element is `Right-To-Left` or not.
 */
export declare function IsRTL(): (target: HTMLPlusElement, key: PropertyKey) => void;

/**
 * Indicates whether the direction of the element is `Right-To-Left` or not.
 */
export declare const isRTL: (target: HTMLPlusElement) => boolean;

/**
 * Will be called whenever the specified event is delivered to the target
 * [More](https://mdn.io/add-event-listener).
 *
 * @param type A case-sensitive string representing the [Event Type](https://mdn.io/events) to listen for.
 * @param options An object that configures
 * [options](https://developer.mozilla.org/docs/Web/API/EventTarget/addEventListener#options)
 * for the event listener.
 */
export declare function Listen(type: string, options?: ListenOptions): (target: HTMLPlusElement, key: PropertyKey, descriptor: PropertyDescriptor) => {
    configurable: boolean;
    get(): any;
};

/**
 * An object that configures
 * [options](https://developer.mozilla.org/docs/Web/API/EventTarget/addEventListener#options)
 * for the event listener.
 */
export declare interface ListenOptions {
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
 * Provides a way to encapsulate functionality within an element
 * and invoke it as needed, both internally and externally.
 */
export declare function Method(): (target: HTMLPlusElement, key: PropertyKey, _descriptor: PropertyDescriptor) => void;

/**
 * TODO
 */
export declare const off: (target: Window | Document | HTMLElement | HTMLPlusElement, type: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => void;

/**
 * TODO
 */
export declare const on: (target: Window | Document | HTMLElement | HTMLPlusElement, type: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => void;

export declare type OverridableValue<T> = T;

export declare function Overrides(): (target: HTMLPlusElement, key: string) => void;

export declare type OverridesConfig<Breakpoint extends string, Properties = unknown> = {
    [Key in Breakpoint]?: Partial<Properties>;
};

/**
 * Creates a reactive property, reflecting a corresponding attribute value,
 * and updates the element when the property is set.
 */
export declare function Property(options?: PropertyOptions): (target: HTMLPlusElement, key: string, descriptor?: PropertyDescriptor) => void;

/**
 * The configuration for property decorator.
 */
export declare interface PropertyOptions {
    /**
     * Specifies the name of the attribute related to the property.
     */
    attribute?: string;
    /**
     * Whether property value is reflected back to the associated attribute. default is `false`.
     */
    reflect?: boolean;
    /**
     * Do not set the value to this property. This value is automatically set during transforming.
     */
    type?: number;
}

export declare function Provider(namespace: string): (target: HTMLPlusElement, key: PropertyKey) => void;

/**
 * Selects the first element in the shadow dom that matches a specified CSS selector.
 *
 * @param selectors A string containing one or more selectors to match.
 * This string must be a valid CSS selector string; if it isn't, a `SyntaxError` exception is thrown. See
 * [Locating DOM elements using selectors](https://developer.mozilla.org/en-US/docs/Web/API/Document_object_model/Locating_DOM_elements_using_selectors)
 * for more about selectors and how to manage them.
 */
export declare function Query(selectors: string): (target: HTMLPlusElement, key: PropertyKey) => void;

/**
 * Selects the first element in the shadow dom that matches a specified CSS selector.
 */
export declare function query(target: HTMLPlusElement, selectors: string): Element | null | undefined;

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
export declare function QueryAll(selectors: string): (target: HTMLPlusElement, key: PropertyKey) => void;

/**
 * Selects all elements in the shadow dom that match a specified CSS selector.
 */
export declare function queryAll(target: HTMLPlusElement, selectors: string): NodeListOf<Element> | undefined;

/**
 * TODO
 */
export declare const setConfig: <N extends string, B extends string>(namespace: N, config: Config<N, B>, options?: ConfigOptions) => void;

/**
 * TODO
 */
export declare const setConfigCreator: <N extends string, B extends string>(namespace: N) => (config: Config<N, B>, options?: ConfigOptions) => void;

/**
 * Returns the slots name.
 */
export declare function Slots(): (target: HTMLPlusElement, key: PropertyKey) => void;

/**
 * Returns the slots name.
 */
export declare const slots: (target: HTMLElement | HTMLPlusElement) => Slots_2;

declare type Slots_2 = {
    [key: string]: boolean;
};

/**
 * Applying this decorator to any `class property` will trigger the
 * element to re-render upon the desired property changes.
 */
export declare function State(): (target: HTMLPlusElement, key: PropertyKey) => void;

export declare function Style(): (target: HTMLPlusElement, key: PropertyKey) => void;

export declare function Variant(): (target: HTMLPlusElement, key: string) => void;

/**
 * Monitors `@Property` and `@State` to detect changes.
 * The decorated method will be called after any changes,
 * with the `key`, `newValue`, and `oldValue` as parameters.
 * If the `key` is not defined, all `@Property` and `@State` are considered.
 *
 * @param keys Collection of `@Property` and `@State` names.
 * @param immediate Triggers the callback immediately after initialization.
 */
export declare function Watch(keys?: string | string[], immediate?: boolean): (target: HTMLPlusElement, key: PropertyKey) => void;

export { }
