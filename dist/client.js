import { kebabCase, pascalCase } from 'change-case';
import { render } from 'preact';
import { API_HOST, STATIC_TAG, API_STACKS, API_REQUEST, API_CONNECTED, LIFECYCLE_UPDATE, METHOD_RENDER, STATIC_STYLE, API_STYLE, LIFECYCLE_UPDATED, API_RENDER_COMPLETED, TYPE_BOOLEAN, TYPE_NUMBER, TYPE_NULL, TYPE_DATE, TYPE_ARRAY, TYPE_OBJECT, TYPE_UNDEFINED, TYPE_STRING, KEY, LIFECYCLE_CONNECTED, LIFECYCLE_DISCONNECTED, LIFECYCLE_CONSTRUCTED, LIFECYCLE_ADOPTED, LIFECYCLE_READY, API_DEFAULTS } from './constants.js';

const call = (target, key, ...args) => {
    return target[key]?.apply(target, args);
};

const typeOf = (input) => {
    return Object.prototype.toString
        .call(input)
        .replace(/\[|\]|object| /g, '')
        .toLowerCase();
};

/**
 * TODO
 */
const classes = (input, smart) => {
    const result = [];
    switch (typeOf(input)) {
        case 'array': {
            for (const item of input) {
                result.push(classes(item, smart));
            }
            break;
        }
        case 'object': {
            const obj = input;
            const keys = Object.keys(obj);
            for (const key of keys) {
                const value = obj[key];
                const name = kebabCase(key);
                const type = typeOf(value);
                if (!smart) {
                    value && result.push(name);
                    continue;
                }
                switch (type) {
                    case 'boolean': {
                        value && result.push(`${name}`);
                        break;
                    }
                    case 'number':
                    case 'string': {
                        result.push(`${name}-${value}`);
                        break;
                    }
                }
            }
            break;
        }
        case 'string': {
            result.push(input);
            break;
        }
    }
    return result.filter((item) => item).join(' ');
};

const merge = (target, ...sources) => {
    for (const source of sources) {
        if (!source)
            continue;
        if (typeOf(source) !== 'object') {
            target = source;
            continue;
        }
        for (const key of Object.keys(source)) {
            if (target[key] instanceof Object &&
                source[key] instanceof Object &&
                target[key] !== source[key]) {
                target[key] = merge(target[key], source[key]);
            }
            else {
                target[key] = source[key];
            }
        }
    }
    return target;
};

/**
 * TODO
 */
const getConfig = (namespace) => {
    return globalThis[`$htmlplus:${namespace}$`] || {};
};
/**
 * TODO
 */
const getConfigCreator = (namespace) => () => {
    return getConfig(namespace);
};
/**
 * TODO
 */
const setConfig = (namespace, config, options) => {
    const previous = options?.override ? {} : globalThis[`$htmlplus:${namespace}$`];
    const next = merge({}, previous, config);
    globalThis[`$htmlplus:${namespace}$`] = next;
};
/**
 * TODO
 */
const setConfigCreator = (namespace) => (config, options) => {
    return setConfig(namespace, config, options);
};

const defineProperty = Object.defineProperty;

/**
 * Indicates the host of the element.
 */
const host = (target) => {
    try {
        return target[API_HOST]();
    }
    catch {
        return target;
    }
};

/**
 * Indicates whether the [Direction](https://mdn.io/css-direction)
 * of the element is `Right-To-Left` or `Left-To-Right`.
 */
const direction = (target) => {
    return getComputedStyle(host(target)).getPropertyValue('direction');
};

const outsides = [];
/**
 * TODO
 */
const dispatch = (target, type, eventInitDict) => {
    const event = new CustomEvent(type, eventInitDict);
    host(target).dispatchEvent(event);
    return event;
};
/**
 * TODO
 */
const on = (target, type, handler, options) => {
    const element = host(target);
    if (type !== 'outside') {
        return element.addEventListener(type, handler, options);
    }
    const callback = (event) => {
        const has = event.composedPath().some((item) => item === element);
        if (has)
            return;
        if (typeof handler === 'function') {
            handler(event);
        }
        else {
            handler.handleEvent(event);
        }
    };
    type = 'ontouchstart' in window.document.documentElement ? 'touchstart' : 'click';
    on(document, type, callback, options);
    outsides.push({
        callback,
        element,
        handler,
        options,
        type
    });
};
/**
 * TODO
 */
const off = (target, type, handler, options) => {
    const element = host(target);
    if (type !== 'outside') {
        return void element.removeEventListener(type, handler, options);
    }
    const index = outsides.findIndex((outside) => {
        return (outside.element === element && outside.handler === handler && outside.options === options);
    });
    const outside = outsides[index];
    if (!outside)
        return;
    off(document, outside.type, outside.callback, outside.options);
    outsides.splice(index, 1);
};

const getFramework = (target) => {
    const element = host(target);
    if ('_qc_' in element)
        return 'qwik';
    if ('_$owner' in element)
        return 'solid';
    if ('__svelte_meta' in element)
        return 'svelte';
    if ('__vnode' in element)
        return 'vue';
    const keys = Object.keys(element);
    const has = (input) => keys.some((key) => key.startsWith(input));
    if (has('_blazor'))
        return 'blazor';
    if (has('__react'))
        return 'react';
    if (has('__zone_symbol__'))
        return 'angular';
};

const getTag = (target) => {
    return target.constructor[STATIC_TAG] ?? target[STATIC_TAG];
};

const getNamespace = (target) => {
    return getTag(target)?.split('-')?.at(0);
};

/**
 * Determines whether the given input string is a valid
 * [CSS Color](https://mdn.io/color-value) or not.
 */
const isCSSColor = (input) => {
    const option = new Option();
    option.style.color = input;
    return option.style.color !== '';
};

const isCSSUnit = (input) => {
    const option = new Option();
    option.style.width = input;
    return option.style.width !== '';
};

/**
 * Indicates whether the direction of the element is `Right-To-Left` or not.
 */
const isRTL = (target) => {
    return direction(target) === 'rtl';
};

/**
 * Indicates whether the current code is running on a server.
 */
const isServer = () => {
    return !(typeof window !== 'undefined' && window.document);
};

const shadowRoot = (target) => {
    return host(target)?.shadowRoot;
};

/**
 * Selects the first element in the shadow dom that matches a specified CSS selector.
 */
function query(target, selectors) {
    return shadowRoot(target)?.querySelector(selectors);
}

/**
 * Selects all elements in the shadow dom that match a specified CSS selector.
 */
function queryAll(target, selectors) {
    return shadowRoot(target)?.querySelectorAll(selectors);
}

const task = (options) => {
    let running;
    let promise;
    const run = () => {
        if (options.canStart && !options.canStart())
            return Promise.resolve(false);
        if (!running)
            promise = enqueue();
        return promise;
    };
    const enqueue = async () => {
        running = true;
        try {
            await promise;
        }
        catch (error) {
            Promise.reject(error);
        }
        // TODO: maybe is optional
        if (!running)
            return promise;
        try {
            if (options.canRun && !options.canRun()) {
                running = false;
                return running;
            }
            options.handler();
            running = false;
            return true;
        }
        catch (error) {
            running = false;
            throw error;
        }
    };
    return run;
};

/**
 * Updates the DOM with a scheduled task.
 * @param target The element instance.
 * @param name Property/State name.
 * @param previous The previous value of Property/State.
 * @param callback Invoked when the rendering phase is completed.
 */
const requestUpdate = (target, name, previous, callback) => {
    // Ensure API_STACKS exists on target
    target[API_STACKS] ||= new Map();
    // Creates/Gets a stacks.
    const stacks = target[API_STACKS];
    // Creates/Updates a stack.
    const stack = stacks.get(name) || { callbacks: [], previous };
    // Adds the callback to the stack, if exists.
    callback && stack.callbacks.push(callback);
    // Stores the stack.
    stacks.set(name, stack);
    // Defines a handler.
    const handler = () => {
        // Skips the rendering phase if DOM isn't ready.
        if (!target[API_CONNECTED])
            return;
        // Calculates the states to pass into lifecycles' callbacks.
        const states = new Map(Array.from(stacks)
            .filter((stack) => stack[0])
            .map((stack) => [stack[0], stack[1].previous]));
        // Calls the lifecycle's callback before the rendering phase.
        call(target, LIFECYCLE_UPDATE, states);
        // Renders template to the DOM.
        // biome-ignore lint: TODO
        render(call(target, METHOD_RENDER) ?? null, shadowRoot(target));
        // Invokes requests' callback.
        stacks.forEach((state) => {
            state.callbacks.forEach((callback, index, callbacks) => {
                callback(callbacks.length - 1 !== index);
            });
        });
        // TODO
        (() => {
            const raw = target.constructor[STATIC_STYLE];
            if (!raw)
                return;
            const regex = /global\s+[^{]+\{[^{}]*\{[^{}]*\}[^{}]*\}|global\s+[^{]+\{[^{}]*\}/g;
            const hasGlobal = raw.includes('global');
            let localSheet = target[API_STYLE];
            let globalSheet = target.constructor[API_STYLE];
            if (localSheet)
                return;
            if (!localSheet) {
                localSheet = new CSSStyleSheet();
                target[API_STYLE] = localSheet;
                shadowRoot(target)?.adoptedStyleSheets.push(localSheet);
            }
            const localStyle = raw.replace(regex, '');
            localSheet.replaceSync(localStyle);
            if (!hasGlobal || globalSheet)
                return;
            if (!globalSheet) {
                globalSheet = new CSSStyleSheet();
                target.constructor[API_STYLE] = globalSheet;
                document.adoptedStyleSheets.push(globalSheet);
            }
            const globalStyle = raw
                ?.match(regex)
                ?.join('')
                ?.replaceAll('global', '')
                ?.replaceAll(':host', getTag(target) || '');
            globalSheet.replaceSync(globalStyle);
        })();
        // Calls the lifecycle's callback after the rendering phase.
        call(target, LIFECYCLE_UPDATED, states);
        // Clears stacks.
        stacks.clear();
        // TODO: related to the @Watch decorator.
        target[API_RENDER_COMPLETED] = true;
    };
    // Creates/Gets a micro task function.
    target[API_REQUEST] ||= task({ handler });
    // Calls the micro task.
    call(target, API_REQUEST);
};

/**
 * Returns the slots name.
 */
const slots = (target) => {
    const element = host(target);
    const slots = {};
    const children = Array.from(element.childNodes);
    for (const child of children) {
        if (child.nodeType === Node.COMMENT_NODE)
            continue;
        let name;
        if (child instanceof HTMLElement) {
            name = child.slot || 'default';
        }
        else if (child.nodeType === Node.TEXT_NODE && child.nodeValue?.trim()) {
            name = 'default';
        }
        if (!name)
            continue;
        slots[name] = true;
    }
    return slots;
};

function toDecorator(util, ...args) {
    return (target, key) => {
        defineProperty(target, key, {
            get() {
                return util(this, ...args);
            }
        });
    };
}

const toProperty = (input, type) => {
    if (type === undefined)
        return input;
    const string = `${input}`;
    const typeNumber = typeof type === 'number' ? type : 0;
    if (TYPE_BOOLEAN & typeNumber || type === Boolean) {
        if (string === '')
            return true;
        if (string === 'true')
            return true;
        if (string === 'false')
            return false;
    }
    if (TYPE_NUMBER & typeNumber || type === Number) {
        if (string !== '' && !Number.isNaN(Number(input))) {
            return parseFloat(string);
        }
    }
    if (TYPE_NULL & typeNumber || type === null) {
        if (string === 'null') {
            return null;
        }
    }
    if (TYPE_DATE & typeNumber || type === Date) {
        const value = new Date(string);
        if (!Number.isNaN(value.getTime())) {
            return value;
        }
    }
    if (TYPE_ARRAY & typeNumber || type === Array) {
        try {
            const value = JSON.parse(string);
            if (typeOf(value) === 'array')
                return value;
        }
        catch { }
    }
    if (TYPE_OBJECT & typeNumber || type === Object) {
        try {
            const value = JSON.parse(string);
            if (typeOf(value) === 'object') {
                return value;
            }
        }
        catch { }
    }
    if (TYPE_UNDEFINED & typeNumber) {
        if (string === 'undefined') {
            return undefined;
        }
    }
    if (TYPE_STRING & typeNumber || type === String) {
        return string;
    }
    // TODO: BigInt, Enum, Function
    try {
        // TODO
        return JSON.parse(string);
    }
    catch {
        return input;
    }
};

const updateAttribute = (target, key, value) => {
    const element = host(target);
    if (value === undefined || value === null || value === false) {
        return void element.removeAttribute(key);
    }
    element.setAttribute(key, value === true ? '' : String(value));
};

const wrapMethod = (mode, target, key, 
// biome-ignore lint: TODO
handler) => {
    // Gets the original function
    const original = target[key];
    // Validate target property
    if (original && typeof original !== 'function') {
        throw new TypeError(`Property ${String(key)} is not a function`);
    }
    // Creates new function
    function wrapped(...args) {
        // Calls the handler before the original
        if (mode === 'before') {
            handler.apply(this, args);
        }
        // Calls the original
        const result = original?.apply(this, args);
        // Calls the handler after the original
        if (mode === 'after') {
            handler.apply(this, args);
        }
        // Returns the result
        return result;
    }
    // Replaces the wrapped with the original one
    target[key] = wrapped;
};

/**
 * Used to bind a method of a class to the current context,
 * making it easier to reference `this` within the method.
 */
function Bind() {
    return (_target, key, descriptor) => {
        const original = descriptor.value;
        return {
            configurable: true,
            get() {
                const next = original.bind(this);
                defineProperty(this, key, {
                    value: next,
                    configurable: true,
                    writable: true
                });
                return next;
            }
        };
    };
}

// biome-ignore-all lint: TODO
function Provider(namespace) {
    return (target, key) => {
        const symbol = Symbol();
        const [MAIN, SUB] = namespace.split('.');
        const prefix = `${KEY}:${MAIN}`;
        const cleanups = (instance) => {
            return (instance[symbol] ||= new Map());
        };
        const update = (instance) => {
            const options = {};
            options.detail = instance[key];
            dispatch(instance, `${prefix}:update`, options);
            if (!SUB)
                return;
            options.bubbles = true;
            dispatch(instance, `${prefix}:${instance[SUB]}:update`, options);
        };
        // TODO
        wrapMethod('after', target, LIFECYCLE_CONNECTED, function () {
            const cleanup = () => {
                off(this, `${prefix}:presence`, onPresence);
                cleanups(this).delete(prefix);
            };
            const onPresence = (event) => {
                event.stopPropagation();
                event.detail(this, this[key]);
            };
            on(this, `${prefix}:presence`, onPresence);
            cleanups(this).set(prefix, cleanup);
        });
        wrapMethod('after', target, LIFECYCLE_UPDATE, function (states) {
            update(this);
            if (cleanups(this).size && !states.has(SUB))
                return;
            cleanups(this).get(`${prefix}:${states.get(SUB)}`)?.();
            const type = `${prefix}:${this[SUB]}`;
            const cleanup = () => {
                off(window, `${type}:presence`, onPresence);
                cleanups(this).delete(type);
                dispatch(window, `${type}:disconnect`);
            };
            const onPresence = () => {
                update(this);
            };
            on(window, `${type}:presence`, onPresence);
            cleanups(this).set(type, cleanup);
        });
        wrapMethod('after', target, LIFECYCLE_DISCONNECTED, function () {
            cleanups(this).forEach((cleanup) => {
                cleanup();
            });
        });
    };
}
function Consumer(namespace) {
    return (target, key) => {
        const symbol = Symbol();
        const [MAIN, SUB] = namespace.split('.');
        const prefix = `${KEY}:${MAIN}`;
        const cleanups = (instance) => {
            return (instance[symbol] ||= new Map());
        };
        const update = (instance, state) => {
            instance[key] = state;
        };
        // TODO
        wrapMethod('after', target, LIFECYCLE_CONNECTED, function () {
            // TODO
            if (SUB && this[SUB])
                return;
            // TODO
            let connected = false;
            const options = {
                bubbles: true
            };
            options.detail = (parent, state) => {
                // TODO
                connected = true;
                update(this, state);
                const cleanup = () => {
                    off(parent, `${prefix}:update`, onUpdate);
                    cleanups(this).delete(prefix);
                    update(this, undefined);
                };
                const onUpdate = (event) => {
                    update(this, event.detail);
                };
                on(parent, `${prefix}:update`, onUpdate);
                cleanups(this).set(prefix, cleanup);
            };
            dispatch(this, `${prefix}:presence`, options);
            // TODO: When the `Provider` element is activated after the `Consumer` element.
            !connected && setTimeout(() => dispatch(this, `${prefix}:presence`, options));
        });
        wrapMethod('after', target, LIFECYCLE_UPDATE, function (states) {
            if (cleanups(this).size && !states.has(SUB))
                return;
            cleanups(this).get(`${prefix}:${states.get(SUB)}`)?.();
            const type = `${prefix}:${this[SUB]}`;
            const cleanup = () => {
                off(window, `${type}:disconnect`, onDisconnect);
                off(window, `${type}:update`, onUpdate);
                cleanups(this).delete(type);
                update(this, undefined);
            };
            const onDisconnect = () => {
                update(this, undefined);
            };
            const onUpdate = (event) => {
                update(this, event.detail);
            };
            on(window, `${type}:disconnect`, onDisconnect);
            on(window, `${type}:update`, onUpdate);
            cleanups(this).set(type, cleanup);
            dispatch(window, `${type}:presence`);
        });
        wrapMethod('after', target, LIFECYCLE_DISCONNECTED, function () {
            cleanups(this).forEach((cleanup) => {
                cleanup();
            });
        });
    };
}

/**
 * A method decorator that applies debounce behavior to a class method.
 * Ensures that the method executes only after the specified delay,
 * resetting the timer if called again within the delay period.
 *
 * @param {number} delay - The debounce delay in milliseconds.
 */
function Debounce(delay = 0) {
    return (target, key, descriptor) => {
        const KEY = Symbol();
        const original = descriptor.value;
        function clear() {
            if (!Object.hasOwn(this, KEY))
                return;
            clearTimeout(this[KEY]);
            delete this[KEY];
        }
        function debounced(...args) {
            clear.call(this);
            this[KEY] = window.setTimeout(() => {
                clear.call(this);
                original.apply(this, args);
            }, delay);
        }
        descriptor.value = debounced;
        return Bind()(target, key, descriptor);
    };
}

/**
 * Indicates whether the [Direction](https://mdn.io/css-direction)
 * of the element is `Right-To-Left` or `Left-To-Right`.
 */
function Direction() {
    return toDecorator(direction);
}

/**
 * The class marked with this decorator is considered a
 * [Custom Element](https://mdn.io/using-custom-elements),
 * and its name, in kebab-case, serves as the element name.
 */
function Element() {
    // biome-ignore lint: TODO
    return (constructor) => {
        if (isServer())
            return;
        const tag = getTag(constructor);
        if (!tag)
            return;
        if (customElements.get(tag))
            return;
        customElements.define(tag, proxy(constructor));
    };
}
// biome-ignore lint: TODO
const proxy = (constructor) => {
    return class Plus extends HTMLElement {
        #instance;
        // biome-ignore lint: TODO
        static formAssociated = constructor['formAssociated'];
        // biome-ignore lint: TODO
        static observedAttributes = constructor['observedAttributes'];
        constructor() {
            super();
            this.attachShadow({
                mode: 'open',
                // biome-ignore lint: TODO
                delegatesFocus: constructor['delegatesFocus'],
                // biome-ignore lint: TODO
                slotAssignment: constructor['slotAssignment']
            });
            // biome-ignore lint: TODO
            this.#instance = new constructor();
            this.#instance[API_HOST] = () => this;
            call(this.#instance, LIFECYCLE_CONSTRUCTED);
        }
        adoptedCallback() {
            call(this.#instance, LIFECYCLE_ADOPTED);
        }
        attributeChangedCallback(key, prev, next) {
            if (prev !== next) {
                this.#instance[`RAW:${key}`] = next;
            }
        }
        connectedCallback() {
            // TODO: experimental for global config
            (() => {
                const namespace = getNamespace(this.#instance) || '';
                const tag = getTag(this.#instance) || '';
                const properties = getConfig(namespace).elements?.[tag]?.properties;
                if (!properties)
                    return;
                const defaults = Object.fromEntries(Object.entries(properties).map(([key, value]) => [
                    key,
                    value?.default
                ]));
                Object.assign(this, defaults);
            })();
            // TODO
            (() => {
                const key = Object.keys(this).find((key) => key.startsWith('__reactProps'));
                const props = this[key];
                if (!props)
                    return;
                for (const [key, value] of Object.entries(props)) {
                    if (this[key] !== undefined)
                        continue;
                    if (key === 'children')
                        continue;
                    if (typeof value !== 'object')
                        continue;
                    this[key] = value;
                }
            })();
            this.#instance[API_CONNECTED] = true;
            call(this.#instance, LIFECYCLE_CONNECTED);
            requestUpdate(this.#instance, undefined, undefined, () => {
                call(this.#instance, LIFECYCLE_READY);
            });
        }
        disconnectedCallback() {
            call(this.#instance, LIFECYCLE_DISCONNECTED);
        }
    };
};

/**
 * Provides the capability to dispatch a [CustomEvent](https://mdn.io/custom-event)
 * from an element.
 *
 * @param options An object that configures options for the event dispatcher.
 */
function Event(options = {}) {
    return (target, key) => {
        target[key] = function (detail) {
            const element = host(this);
            const framework = getFramework(this);
            options.bubbles ??= false;
            let type = String(key);
            switch (framework) {
                // TODO: Experimental
                case 'blazor':
                    options.bubbles = true;
                    type = pascalCase(type);
                    try {
                        // biome-ignore lint: TODO
                        window['Blazor'].registerCustomEventType(type, {
                            createEventArgs: (event) => ({
                                detail: event.detail
                            })
                        });
                    }
                    catch { }
                    break;
                case 'qwik':
                case 'solid':
                    type = pascalCase(type).toLowerCase();
                    break;
                case 'react':
                case 'preact':
                    type = pascalCase(type);
                    break;
                default:
                    type = kebabCase(type);
                    break;
            }
            let event;
            const resolver = getConfig(getNamespace(target) || '').event?.resolver;
            event ||= resolver?.({ detail, element, framework, options, type });
            event && element.dispatchEvent(event);
            event ||= dispatch(this, type, { ...options, detail });
            return event;
        };
    };
}

/**
 * Indicates the host of the element.
 */
function Host() {
    return toDecorator(host);
}

/**
 * Indicates whether the direction of the element is `Right-To-Left` or not.
 */
function IsRTL() {
    return toDecorator(isRTL);
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
function Listen(type, options) {
    return (target, key, descriptor) => {
        const element = (instance) => {
            switch (options?.target) {
                case 'body':
                    return window.document.body;
                case 'document':
                    return window.document;
                case 'window':
                    return window;
                case 'host':
                    return instance;
                default:
                    return instance;
            }
        };
        wrapMethod('before', target, LIFECYCLE_CONNECTED, function () {
            on(element(this), type, this[key], options);
        });
        wrapMethod('before', target, LIFECYCLE_DISCONNECTED, function () {
            off(element(this), type, this[key], options);
        });
        return Bind()(target, key, descriptor);
    };
}

/**
 * Provides a way to encapsulate functionality within an element
 * and invoke it as needed, both internally and externally.
 */
function Method() {
    return (target, key, _descriptor) => {
        wrapMethod('before', target, LIFECYCLE_CONSTRUCTED, function () {
            host(this)[key] = this[key].bind(this);
        });
    };
}

const CONTAINER_DATA = Symbol();
const getContainers = (breakpoints) => {
    return Object.entries(breakpoints || {}).reduce((result, [key, breakpoint]) => {
        if (breakpoint.type !== 'container')
            return result;
        result[key] = {
            min: breakpoint.min,
            max: breakpoint.max
        };
        return result;
    }, {});
};
const getMedias = (breakpoints) => {
    return Object.entries(breakpoints || {}).reduce((result, [key, breakpoint]) => {
        if (breakpoint.type !== 'media')
            return result;
        const parts = [];
        const min = 'min' in breakpoint ? breakpoint.min : undefined;
        const max = 'max' in breakpoint ? breakpoint.max : undefined;
        if (min !== undefined)
            parts.push(`(min-width: ${min}px)`);
        if (max !== undefined)
            parts.push(`(max-width: ${max}px)`);
        const query = parts.join(' and ');
        if (query)
            result[key] = query;
        return result;
    }, {});
};
const matchContainer = (element, container) => {
    const getData = () => {
        if (element[CONTAINER_DATA])
            return element[CONTAINER_DATA];
        const listeners = new Set();
        const observer = new ResizeObserver(() => {
            listeners.forEach((listener) => {
                listener();
            });
        });
        observer.observe(element);
        element[CONTAINER_DATA] = { listeners, observer };
        return element[CONTAINER_DATA];
    };
    const getMatches = () => {
        const width = element.offsetWidth;
        const matches = (container.min === undefined || width >= container.min) &&
            (container.max === undefined || width <= container.max);
        return matches;
    };
    const addEventListener = (_type, listener) => {
        getData().listeners.add(listener);
    };
    const removeEventListener = (_type, listener) => {
        const data = getData();
        data.listeners.delete(listener);
        if (data.listeners.size !== 0)
            return;
        data.observer.disconnect();
        delete element[CONTAINER_DATA];
    };
    return {
        get matches() {
            return getMatches();
        },
        addEventListener,
        removeEventListener
    };
};
function Overrides() {
    return (target, key) => {
        const DISPOSERS = Symbol();
        const breakpoints = getConfig(getNamespace(target) || '').breakpoints || {};
        const containers = getContainers(breakpoints);
        const medias = getMedias(breakpoints);
        wrapMethod('after', target, LIFECYCLE_UPDATE, function (states) {
            if (!states.has(key))
                return;
            this[DISPOSERS] ??= new Map();
            const disposers = this[DISPOSERS];
            const overrides = this[key] || {};
            const activeKeys = new Set(disposers.keys());
            const overrideKeys = Object.keys(overrides);
            const containerKeys = overrideKeys.filter((breakpoint) => breakpoint in containers);
            const mediaKeys = overrideKeys.filter((breakpoint) => breakpoint in medias);
            let next = {};
            let scheduled = false;
            const apply = (overrideKey) => {
                overrideKey && Object.assign(next, overrides[overrideKey]);
                if (scheduled)
                    return;
                scheduled = true;
                queueMicrotask(() => {
                    scheduled = false;
                    const defaults = Object.assign({}, this[API_DEFAULTS], next);
                    delete defaults[key];
                    Object.assign(host(this), defaults);
                    next = {};
                });
            };
            for (const overrideKey of overrideKeys) {
                if (activeKeys.delete(overrideKey))
                    continue;
                const breakpoint = breakpoints[overrideKey];
                if (!breakpoint)
                    continue;
                switch (breakpoint.type) {
                    case 'container': {
                        const container = containers[overrideKey];
                        if (!container)
                            break;
                        const containerQueryList = matchContainer(host(this), container);
                        const change = () => {
                            for (const containerKey of containerKeys) {
                                if (matchContainer(host(this), containers[containerKey]).matches) {
                                    apply(containerKey);
                                }
                            }
                            apply();
                        };
                        containerQueryList.addEventListener('change', change);
                        const disposer = () => {
                            containerQueryList.removeEventListener('change', change);
                        };
                        disposers.set(overrideKey, disposer);
                        if (!containerQueryList.matches)
                            break;
                        change();
                        break;
                    }
                    case 'media': {
                        const media = medias[overrideKey];
                        if (!media)
                            break;
                        const mediaQueryList = window.matchMedia(media);
                        const change = () => {
                            for (const mediaKey of mediaKeys) {
                                if (window.matchMedia(medias[mediaKey]).matches) {
                                    apply(mediaKey);
                                }
                            }
                            apply();
                        };
                        mediaQueryList.addEventListener('change', change);
                        const disposer = () => {
                            mediaQueryList.removeEventListener('change', change);
                        };
                        disposers.set(overrideKey, disposer);
                        if (!mediaQueryList.matches)
                            break;
                        change();
                        break;
                    }
                }
            }
            for (const activeKey of activeKeys) {
                const disposer = disposers.get(activeKey);
                disposer?.();
                disposers.delete(activeKey);
            }
        });
        wrapMethod('after', target, LIFECYCLE_DISCONNECTED, function () {
            this[DISPOSERS] ??= new Map();
            const disposers = this[DISPOSERS];
            disposers.forEach((disposer) => {
                disposer();
            });
            disposers.clear();
        });
    };
}

/**
 * Creates a reactive property, reflecting a corresponding attribute value,
 * and updates the element when the property is set.
 */
function Property(options) {
    return (target, key, descriptor) => {
        // Unique symbol for property storage to avoid naming conflicts
        const KEY = Symbol();
        // Unique symbol for the lock flag to prevent infinite loops during updates
        const LOCKED = Symbol();
        // Calculate attribute name from the property key if not explicitly provided
        const attribute = options?.attribute || kebabCase(key);
        // Store the original setter (if it exists) to preserve its behavior
        const originalSetter = descriptor?.set;
        // Ensure the element class has an observedAttributes array
        // biome-ignore lint: TODO
        target.constructor['observedAttributes'] ||= [];
        // Register the attribute in the observedAttributes array for the element
        // biome-ignore lint: TODO
        target.constructor['observedAttributes'].push(attribute);
        // Getter function to retrieve the property value
        function get() {
            return this[KEY];
        }
        // Setter function to update the property value and trigger updates
        function set(value) {
            // Store the previous value
            const previous = this[KEY];
            // Store the new value
            const next = value;
            // Skip updates if the value hasn't changed and no custom setter is defined
            if (!originalSetter && next === previous)
                return;
            // If a custom setter exists, call it with the new value
            if (originalSetter) {
                originalSetter.call(this, next);
            }
            // Otherwise, update the property directly
            else {
                this[KEY] = next;
            }
            // Request an update
            requestUpdate(this, key, previous, (skipped) => {
                // Skip if the update was aborted
                if (skipped)
                    return;
                // If reflection is enabled, update the corresponding attribute
                if (!options?.reflect)
                    return;
                // Lock to prevent infinite loops
                this[LOCKED] = true;
                // Update the attribute
                updateAttribute(this, attribute, next);
                // Unlock
                this[LOCKED] = false;
            });
        }
        // Override the property descriptor if a custom setter exists
        if (originalSetter) {
            descriptor.set = set;
        }
        // Attach the getter and setter to the target class property if no descriptor exists
        if (!descriptor) {
            defineProperty(target, key, { configurable: true, get, set });
        }
        /**
         * Define a raw property setter to handle updates that trigger from the `attributeChangedCallback`,
         * To intercept and process raw attribute values before they are assigned to the property
         */
        defineProperty(target, `RAW:${attribute}`, {
            set(value) {
                if (!this[LOCKED]) {
                    // Convert the raw value and set it to the corresponding property
                    this[key] = toProperty(value, options?.type);
                }
            }
        });
        // TODO
        wrapMethod('before', target, LIFECYCLE_CONNECTED, function () {
            this[API_DEFAULTS] ||= {};
            this[API_DEFAULTS][key] = this[key];
        });
        // Attach getter and setter to the host element on construction
        wrapMethod('before', target, LIFECYCLE_CONSTRUCTED, function () {
            const get = () => {
                if (descriptor && !descriptor.get) {
                    throw new Error(`Property '${key}' does not have a getter. Unable to retrieve value.`);
                }
                return this[key];
            };
            const set = (value) => {
                if (descriptor && !descriptor.set) {
                    throw new Error(`Property '${key}' does not have a setter. Unable to assign value.`);
                }
                this[key] = value;
            };
            defineProperty(host(this), key, { configurable: true, get, set });
        });
        /**
         * TODO: Review these behaviors again.
         *
         * When a property has a reflect and either a getter, a setter, or both are available,
         * three approaches are possible:
         *
         * 1. Only a getter is present: The attribute updates after each render is completed.
         * 2. Only a setter is present: The attribute updates after each setter call.
         * 3. Both getter and setter are present: The attribute is updated via the setter call
         *    and also after each render is completed, resulting in two attribute update processes.
         */
        if (options?.reflect && descriptor?.get) {
            wrapMethod('before', target, LIFECYCLE_UPDATED, function () {
                // Lock to prevent infinite loops
                this[LOCKED] = true;
                // Update the attribute
                updateAttribute(this, attribute, this[key]);
                // Unlock
                this[LOCKED] = false;
            });
        }
    };
}

/**
 * Selects the first element in the shadow dom that matches a specified CSS selector.
 *
 * @param selectors A string containing one or more selectors to match.
 * This string must be a valid CSS selector string; if it isn't, a `SyntaxError` exception is thrown. See
 * [Locating DOM elements using selectors](https://developer.mozilla.org/en-US/docs/Web/API/Document_object_model/Locating_DOM_elements_using_selectors)
 * for more about selectors and how to manage them.
 */
function Query(selectors) {
    return toDecorator(query, selectors);
}

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
function QueryAll(selectors) {
    return toDecorator(queryAll, selectors);
}

/**
 * Returns the slots name.
 */
function Slots() {
    return toDecorator(slots);
}

/**
 * Applying this decorator to any `class property` will trigger the
 * element to re-render upon the desired property changes.
 */
function State() {
    return (target, key) => {
        const KEY = Symbol();
        const name = String(key);
        defineProperty(target, key, {
            enumerable: true,
            configurable: true,
            get() {
                return this[KEY];
            },
            set(next) {
                const previous = this[KEY];
                if (next === previous)
                    return;
                this[KEY] = next;
                requestUpdate(this, name, previous);
            }
        });
    };
}

// TODO: check the logic
function Style() {
    return (target, key) => {
        const LAST = Symbol();
        const SHEET = Symbol();
        wrapMethod('before', target, LIFECYCLE_UPDATED, function () {
            let sheet = this[SHEET];
            let value = this[key];
            const update = (value) => (result) => {
                if (value && value !== this[LAST])
                    return;
                sheet.replaceSync(toCssString(result));
                this[LAST] = undefined;
            };
            if (!sheet) {
                sheet = new CSSStyleSheet();
                this[SHEET] = sheet;
                shadowRoot(this)?.adoptedStyleSheets.push(sheet);
            }
            if (typeof value === 'function') {
                value = value.call(this);
            }
            if (value instanceof Promise) {
                // biome-ignore lint: TODO
                value.then(update((this[LAST] = value))).catch((error) => {
                    throw new Error('TODO', { cause: error });
                });
            }
            else {
                update()(value);
            }
        });
    };
}
const toCssString = (input) => {
    if (typeof input === 'string') {
        return input.trim();
    }
    if (Array.isArray(input)) {
        return input
            .map((item) => toCssString(item))
            .filter(Boolean)
            .join('\n');
    }
    if (input === null)
        return '';
    if (typeof input !== 'object')
        return '';
    let result = '';
    for (const key of Object.keys(input)) {
        const value = input[key];
        const ignore = [null, undefined, false].includes(value);
        if (ignore)
            continue;
        const cssKey = key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
        if (typeof value === 'object') {
            result += `${cssKey} {${toCssString(value)}}`;
        }
        else {
            result += `${cssKey}: ${value};`;
        }
    }
    return result;
};

function Variant() {
    return (target, key) => {
        wrapMethod('after', target, LIFECYCLE_UPDATE, function (states) {
            if (!states.has(key))
                return;
            const namespace = getNamespace(target) || '';
            const tag = getTag(this) || '';
            const properties = getConfig(namespace).elements?.[tag]?.variants?.[this[key]]?.properties;
            if (!properties)
                return;
            const defaults = Object.assign({}, this[API_DEFAULTS], properties);
            delete defaults[key];
            Object.assign(this, defaults);
        });
    };
}

/**
 * Monitors `@Property` and `@State` to detect changes.
 * The decorated method will be called after any changes,
 * with the `key`, `newValue`, and `oldValue` as parameters.
 * If the `key` is not defined, all `@Property` and `@State` are considered.
 *
 * @param keys Collection of `@Property` and `@State` names.
 * @param immediate Triggers the callback immediately after initialization.
 */
function Watch(keys, immediate) {
    return (target, key) => {
        // Gets all keys
        const all = [keys].flat().filter((item) => item);
        // Registers a lifecycle to detect changes.
        wrapMethod('after', target, LIFECYCLE_UPDATED, function (states) {
            // Skips the logic if 'immediate' wasn't passed.
            if (!immediate && !this[API_RENDER_COMPLETED])
                return;
            // Loops the keys.
            states.forEach((previous, item) => {
                // Skips the current key.
                if (all.length && !all.includes(item))
                    return;
                // Invokes the method with parameters.
                this[key](this[item], previous, item);
            });
        });
    };
}

export { Bind, Consumer, Debounce, Direction, Element, Event, Host, IsRTL, Listen, Method, Overrides, Property, Provider, Query, QueryAll, Slots, State, Style, Variant, Watch, classes, direction, dispatch, getConfig, getConfigCreator, host, isCSSColor, isCSSUnit, isRTL, off, on, query, queryAll, setConfig, setConfigCreator, slots };
