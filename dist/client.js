import { API_HOST, STATIC_TAG, API_STACKS, API_REQUEST, API_CONNECTED, LIFECYCLE_UPDATE, METHOD_RENDER, STATIC_STYLE, API_STYLE, LIFECYCLE_UPDATED, API_RENDER_COMPLETED, TYPE_NULL, TYPE_UNDEFINED, TYPE_BOOLEAN, TYPE_BIGINT, TYPE_NUMBER, TYPE_DATE, TYPE_ARRAY, TYPE_OBJECT, TYPE_FUNCTION, TYPE_ENUM, TYPE_STRING, TYPE_ANY, KEY, LIFECYCLE_CONNECTED, LIFECYCLE_DISCONNECTED, LIFECYCLE_CONSTRUCTED, LIFECYCLE_ADOPTED, LIFECYCLE_READY, API_DEFAULTS } from "./constants.js";
import { render } from "preact";
import { kebabCase, pascalCase } from "change-case";
const call = (target, key, ...args) => {
  return target[key]?.apply(target, args);
};
const typeOf = (input) => {
  return Object.prototype.toString.call(input).replace(/\[|\]|object| /g, "").toLowerCase();
};
const classes = (input, smart) => {
  const result = [];
  switch (typeOf(input)) {
    case "array": {
      for (const item of input) {
        result.push(classes(item, smart));
      }
      break;
    }
    case "object": {
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
          case "boolean": {
            value && result.push(`${name}`);
            break;
          }
          case "number":
          case "string": {
            result.push(`${name}-${value}`);
            break;
          }
        }
      }
      break;
    }
    case "string": {
      result.push(input);
      break;
    }
  }
  return result.filter((item) => item).join(" ");
};
const merge = (target, ...sources) => {
  for (const source of sources) {
    if (!source) continue;
    if (typeOf(source) !== "object") {
      target = source;
      continue;
    }
    for (const key of Object.keys(source)) {
      if (target[key] instanceof Object && source[key] instanceof Object && target[key] !== source[key]) {
        target[key] = merge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
  return target;
};
const getConfig = (namespace) => {
  return globalThis[`$htmlplus:${namespace}$`] || {};
};
const getConfigCreator = (namespace) => () => {
  return getConfig(namespace);
};
const setConfig = (namespace, config, options) => {
  const previous = options?.override ? {} : globalThis[`$htmlplus:${namespace}$`];
  const next = merge({}, previous, config);
  globalThis[`$htmlplus:${namespace}$`] = next;
};
const setConfigCreator = (namespace) => (config, options) => {
  return setConfig(namespace, config, options);
};
const defineProperty = Object.defineProperty;
const host = (target) => {
  try {
    return target[API_HOST]();
  } catch {
    return target;
  }
};
const direction = (target) => {
  return getComputedStyle(host(target)).getPropertyValue("direction");
};
const outsides = [];
const dispatch = (target, type, eventInitDict) => {
  const event = new CustomEvent(type, eventInitDict);
  host(target).dispatchEvent(event);
  return event;
};
const on = (target, type, handler, options) => {
  const element = host(target);
  if (type !== "outside") {
    return element.addEventListener(type, handler, options);
  }
  const callback = (event) => {
    const has = event.composedPath().some((item) => item === element);
    if (has) return;
    if (typeof handler === "function") {
      handler(event);
    } else {
      handler.handleEvent(event);
    }
  };
  type = "ontouchstart" in window.document.documentElement ? "touchstart" : "click";
  on(document, type, callback, options);
  outsides.push({
    callback,
    element,
    handler,
    options,
    type
  });
};
const off = (target, type, handler, options) => {
  const element = host(target);
  if (type !== "outside") {
    return void element.removeEventListener(type, handler, options);
  }
  const index = outsides.findIndex((outside2) => {
    return outside2.element === element && outside2.handler === handler && outside2.options === options;
  });
  const outside = outsides[index];
  if (!outside) return;
  off(document, outside.type, outside.callback, outside.options);
  outsides.splice(index, 1);
};
const getFramework = (target) => {
  const element = host(target);
  if ("_qc_" in element) return "qwik";
  if ("_$owner" in element) return "solid";
  if ("__svelte_meta" in element) return "svelte";
  if ("__vnode" in element) return "vue";
  const keys = Object.keys(element);
  const has = (input) => keys.some((key) => key.startsWith(input));
  if (has("_blazor")) return "blazor";
  if (has("__react")) return "react";
  if (has("__zone_symbol__")) return "angular";
};
const getTag = (target) => {
  return target.constructor[STATIC_TAG] ?? target[STATIC_TAG];
};
const getNamespace = (target) => {
  return getTag(target)?.split("-")?.at(0);
};
const isCSSColor = (input) => {
  const option = new Option();
  option.style.color = input;
  return option.style.color !== "";
};
const isCSSUnit = (input) => {
  const option = new Option();
  option.style.width = input;
  return option.style.width !== "";
};
const isRTL = (target) => {
  return direction(target) === "rtl";
};
const isServer = () => {
  return !(typeof window !== "undefined" && window.document);
};
const shadowRoot = (target) => {
  return host(target)?.shadowRoot;
};
function query(target, selectors) {
  return shadowRoot(target)?.querySelector(selectors);
}
function queryAll(target, selectors) {
  return shadowRoot(target)?.querySelectorAll(selectors);
}
const task = (options) => {
  let running;
  let promise;
  const run = () => {
    if (options.canStart && !options.canStart()) return Promise.resolve(false);
    if (!running) promise = enqueue();
    return promise;
  };
  const enqueue = async () => {
    running = true;
    try {
      await promise;
    } catch (error) {
      Promise.reject(error);
    }
    if (!running) return promise;
    try {
      if (options.canRun && !options.canRun()) {
        running = false;
        return running;
      }
      options.handler();
      running = false;
      return true;
    } catch (error) {
      running = false;
      throw error;
    }
  };
  return run;
};
const requestUpdate = (target, name, previous, callback) => {
  target[API_STACKS] ||= /* @__PURE__ */ new Map();
  const stacks = target[API_STACKS];
  const stack = stacks.get(name) || { callbacks: [], previous };
  callback && stack.callbacks.push(callback);
  stacks.set(name, stack);
  const handler = () => {
    if (!target[API_CONNECTED]) return;
    const states = new Map(
      Array.from(stacks).filter((stack2) => stack2[0]).map((stack2) => [stack2[0], stack2[1].previous])
    );
    call(target, LIFECYCLE_UPDATE, states);
    render(call(target, METHOD_RENDER) ?? null, shadowRoot(target));
    stacks.forEach((state) => {
      state.callbacks.forEach((callback2, index, callbacks) => {
        callback2(callbacks.length - 1 !== index);
      });
    });
    (() => {
      const raw = target.constructor[STATIC_STYLE];
      if (!raw) return;
      const regex = /global\s+[^{]+\{[^{}]*\{[^{}]*\}[^{}]*\}|global\s+[^{]+\{[^{}]*\}/g;
      const hasGlobal = raw.includes("global");
      let localSheet = target[API_STYLE];
      let globalSheet = target.constructor[API_STYLE];
      if (localSheet) return;
      if (!localSheet) {
        localSheet = new CSSStyleSheet();
        target[API_STYLE] = localSheet;
        shadowRoot(target)?.adoptedStyleSheets.push(localSheet);
      }
      const localStyle = raw.replace(regex, "");
      localSheet.replaceSync(localStyle);
      if (!hasGlobal || globalSheet) return;
      if (!globalSheet) {
        globalSheet = new CSSStyleSheet();
        target.constructor[API_STYLE] = globalSheet;
        document.adoptedStyleSheets.push(globalSheet);
      }
      const globalStyle = raw?.match(regex)?.join("")?.replaceAll("global", "")?.replaceAll(":host", getTag(target) || "");
      globalSheet.replaceSync(globalStyle);
    })();
    call(target, LIFECYCLE_UPDATED, states);
    stacks.clear();
    target[API_RENDER_COMPLETED] = true;
  };
  target[API_REQUEST] ||= task({ handler });
  call(target, API_REQUEST);
};
const slots = (target) => {
  const element = host(target);
  const slots2 = {};
  const children = Array.from(element.childNodes);
  for (const child of children) {
    if (child.nodeType === Node.COMMENT_NODE) continue;
    let name;
    if (child instanceof HTMLElement) {
      name = child.slot || "default";
    } else if (child.nodeType === Node.TEXT_NODE && child.nodeValue?.trim()) {
      name = "default";
    }
    if (!name) continue;
    slots2[name] = true;
  }
  return slots2;
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
const TYPES = [
  {
    flag: TYPE_NULL,
    check: (value) => {
      return value === null;
    },
    parse: (value) => {
      if (value === "null") {
        return null;
      }
    }
  },
  {
    flag: TYPE_UNDEFINED,
    check: (value) => {
      return value === void 0;
    },
    parse: (value) => {
      if (value === "undefined") {
        return void 0;
      }
    }
  },
  {
    flag: TYPE_BOOLEAN,
    check: (value) => {
      return typeof value === "boolean";
    },
    parse: (value) => {
      if (value === "") return true;
      if (value === "true") return true;
      if (value === "false") return false;
    }
  },
  {
    flag: TYPE_BIGINT,
    check: (value) => {
      return typeof value === "bigint";
    },
    parse: (value) => {
      if (/^\d+n$/.test(value)) {
        return BigInt(value.slice(0, -1));
      }
    }
  },
  {
    flag: TYPE_NUMBER,
    check: (value) => {
      return typeof value === "number" && !Number.isNaN(value);
    },
    parse: (value) => {
      if (value !== "" && !Number.isNaN(Number(value))) {
        return parseFloat(value);
      }
    }
  },
  {
    flag: TYPE_DATE,
    check: (value) => {
      return value instanceof Date && !Number.isNaN(value.getTime());
    },
    parse: (value) => {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) {
        return date;
      }
    }
  },
  {
    flag: TYPE_ARRAY,
    check: (value) => {
      return Array.isArray(value);
    },
    parse: (value) => {
      if (value.startsWith("[") && value.endsWith("]")) {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) return parsed;
        } catch {
        }
      }
    }
  },
  {
    flag: TYPE_OBJECT,
    check: (value) => {
      return typeof value === "object" && value !== null && !Array.isArray(value);
    },
    parse: (value) => {
      if (value.startsWith("{") && value.endsWith("}")) {
        try {
          const parsed = JSON.parse(value);
          if (!Array.isArray(parsed)) return parsed;
        } catch {
        }
      }
    }
  },
  {
    flag: TYPE_FUNCTION,
    check: (value) => {
      return typeof value === "function";
    },
    parse: () => {
      throw new Error("TODO");
    }
  },
  {
    flag: TYPE_ENUM,
    check: (value) => {
      return typeof value === "string";
    },
    parse: (value) => {
      return value;
    }
  },
  {
    flag: TYPE_STRING,
    check: (value) => {
      return typeof value === "string";
    },
    parse: (value) => {
      return value;
    }
  },
  // TODO
  {
    flag: TYPE_ANY,
    check: () => {
      return true;
    },
    parse: (value) => {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
  }
];
const ensureIsType = (value, type = 0) => {
  for (const handler of TYPES) {
    if (!(type & handler.flag)) continue;
    if (!handler.check(value)) continue;
    return;
  }
  throw new Error(`Invalid value "${value}" for allowed types.`);
};
const toProperty = (value, type = 0) => {
  if (value === null) return null;
  for (const handler of TYPES) {
    if (!(type & handler.flag)) continue;
    const result = handler.parse(value);
    if (result === void 0) continue;
    return result;
  }
  throw new Error(`Cannot parse value "${value}" for allowed types.`);
};
const updateAttribute = (target, key, value) => {
  const element = host(target);
  if (value === void 0 || value === null || value === false) {
    return void element.removeAttribute(key);
  }
  element.setAttribute(key, value === true ? "" : String(value));
};
const wrapMethod = (mode, target, key, handler) => {
  const original = target[key];
  if (original && typeof original !== "function") {
    throw new TypeError(`Property ${String(key)} is not a function`);
  }
  function wrapped(...args) {
    if (mode === "before") {
      handler.apply(this, args);
    }
    const result = original?.apply(this, args);
    if (mode === "after") {
      handler.apply(this, args);
    }
    return result;
  }
  target[key] = wrapped;
};
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
function Provider(namespace) {
  return (target, key) => {
    const symbol = /* @__PURE__ */ Symbol();
    const [MAIN, SUB] = namespace.split(".");
    const prefix = `${KEY}:${MAIN}`;
    const cleanups = (instance) => {
      return instance[symbol] ||= /* @__PURE__ */ new Map();
    };
    const update = (instance) => {
      const options = {};
      options.detail = instance[key];
      dispatch(instance, `${prefix}:update`, options);
      if (!SUB) return;
      options.bubbles = true;
      dispatch(instance, `${prefix}:${instance[SUB]}:update`, options);
    };
    wrapMethod("after", target, LIFECYCLE_CONNECTED, function() {
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
    wrapMethod("after", target, LIFECYCLE_UPDATE, function(states) {
      update(this);
      if (cleanups(this).size && !states.has(SUB)) return;
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
    wrapMethod("after", target, LIFECYCLE_DISCONNECTED, function() {
      cleanups(this).forEach((cleanup) => {
        cleanup();
      });
    });
  };
}
function Consumer(namespace) {
  return (target, key) => {
    const symbol = /* @__PURE__ */ Symbol();
    const [MAIN, SUB] = namespace.split(".");
    const prefix = `${KEY}:${MAIN}`;
    const cleanups = (instance) => {
      return instance[symbol] ||= /* @__PURE__ */ new Map();
    };
    const update = (instance, state) => {
      instance[key] = state;
    };
    wrapMethod("after", target, LIFECYCLE_CONNECTED, function() {
      if (SUB && this[SUB]) return;
      let connected = false;
      const options = {
        bubbles: true
      };
      options.detail = (parent, state) => {
        connected = true;
        update(this, state);
        const cleanup = () => {
          off(parent, `${prefix}:update`, onUpdate);
          cleanups(this).delete(prefix);
          update(this, void 0);
        };
        const onUpdate = (event) => {
          update(this, event.detail);
        };
        on(parent, `${prefix}:update`, onUpdate);
        cleanups(this).set(prefix, cleanup);
      };
      dispatch(this, `${prefix}:presence`, options);
      !connected && setTimeout(() => dispatch(this, `${prefix}:presence`, options));
    });
    wrapMethod("after", target, LIFECYCLE_UPDATE, function(states) {
      if (cleanups(this).size && !states.has(SUB)) return;
      cleanups(this).get(`${prefix}:${states.get(SUB)}`)?.();
      const type = `${prefix}:${this[SUB]}`;
      const cleanup = () => {
        off(window, `${type}:disconnect`, onDisconnect);
        off(window, `${type}:update`, onUpdate);
        cleanups(this).delete(type);
        update(this, void 0);
      };
      const onDisconnect = () => {
        update(this, void 0);
      };
      const onUpdate = (event) => {
        update(this, event.detail);
      };
      on(window, `${type}:disconnect`, onDisconnect);
      on(window, `${type}:update`, onUpdate);
      cleanups(this).set(type, cleanup);
      dispatch(window, `${type}:presence`);
    });
    wrapMethod("after", target, LIFECYCLE_DISCONNECTED, function() {
      cleanups(this).forEach((cleanup) => {
        cleanup();
      });
    });
  };
}
function Debounce(delay = 0) {
  return (target, key, descriptor) => {
    const KEY2 = /* @__PURE__ */ Symbol();
    const original = descriptor.value;
    function clear() {
      if (!Object.hasOwn(this, KEY2)) return;
      clearTimeout(this[KEY2]);
      delete this[KEY2];
    }
    function debounced(...args) {
      clear.call(this);
      this[KEY2] = window.setTimeout(() => {
        clear.call(this);
        original.apply(this, args);
      }, delay);
    }
    descriptor.value = debounced;
    return Bind()(target, key, descriptor);
  };
}
function Direction() {
  return toDecorator(direction);
}
function Element() {
  return (constructor) => {
    if (isServer()) return;
    const tag = getTag(constructor);
    if (!tag) return;
    if (customElements.get(tag)) return;
    customElements.define(tag, proxy(constructor));
  };
}
const proxy = (constructor) => {
  return class Plus extends HTMLElement {
    #instance;
    // biome-ignore lint: TODO
    static formAssociated = constructor["formAssociated"];
    // biome-ignore lint: TODO
    static observedAttributes = constructor["observedAttributes"];
    constructor() {
      super();
      this.attachShadow({
        mode: "open",
        // biome-ignore lint: TODO
        delegatesFocus: constructor["delegatesFocus"],
        // biome-ignore lint: TODO
        slotAssignment: constructor["slotAssignment"]
      });
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
      (() => {
        const namespace = getNamespace(this.#instance) || "";
        const tag = getTag(this.#instance) || "";
        const properties = getConfig(namespace).elements?.[tag]?.properties;
        if (!properties) return;
        const defaults = Object.fromEntries(
          Object.entries(properties).map(([key, value]) => [
            key,
            value?.default
          ])
        );
        Object.assign(this, defaults);
      })();
      (() => {
        const key = Object.keys(this).find((key2) => key2.startsWith("__reactProps"));
        const props = this[key];
        if (!props) return;
        for (const [key2, value] of Object.entries(props)) {
          if (this[key2] !== void 0) continue;
          if (key2 === "children") continue;
          if (typeof value !== "object") continue;
          this[key2] = value;
        }
      })();
      this.#instance[API_CONNECTED] = true;
      call(this.#instance, LIFECYCLE_CONNECTED);
      requestUpdate(this.#instance, void 0, void 0, () => {
        call(this.#instance, LIFECYCLE_READY);
      });
    }
    disconnectedCallback() {
      call(this.#instance, LIFECYCLE_DISCONNECTED);
    }
  };
};
function Event(options = {}) {
  return (target, key) => {
    target[key] = function(detail) {
      const element = host(this);
      const framework = getFramework(this);
      options.bubbles ??= false;
      let type = String(key);
      switch (framework) {
        // TODO: Experimental
        case "blazor":
          options.bubbles = true;
          type = pascalCase(type);
          try {
            window["Blazor"].registerCustomEventType(type, {
              createEventArgs: (event2) => ({
                detail: event2.detail
              })
            });
          } catch {
          }
          break;
        case "qwik":
        case "solid":
          type = pascalCase(type).toLowerCase();
          break;
        case "react":
        case "preact":
          type = pascalCase(type);
          break;
        default:
          type = kebabCase(type);
          break;
      }
      let event;
      const resolver = getConfig(getNamespace(target) || "").event?.resolver;
      event ||= resolver?.({ detail, element, framework, options, type });
      event && element.dispatchEvent(event);
      event ||= dispatch(this, type, { ...options, detail });
      return event;
    };
  };
}
function Host() {
  return toDecorator(host);
}
function IsRTL() {
  return toDecorator(isRTL);
}
function Listen(type, options) {
  return (target, key, descriptor) => {
    const element = (instance) => {
      switch (options?.target) {
        case "body":
          return window.document.body;
        case "document":
          return window.document;
        case "window":
          return window;
        case "host":
          return instance;
        default:
          return instance;
      }
    };
    wrapMethod("before", target, LIFECYCLE_CONNECTED, function() {
      on(element(this), type, this[key], options);
    });
    wrapMethod("before", target, LIFECYCLE_DISCONNECTED, function() {
      off(element(this), type, this[key], options);
    });
    return Bind()(target, key, descriptor);
  };
}
function Method() {
  return (target, key, _descriptor) => {
    wrapMethod("before", target, LIFECYCLE_CONSTRUCTED, function() {
      host(this)[key] = this[key].bind(this);
    });
  };
}
const CONTAINER_DATA = /* @__PURE__ */ Symbol();
const getContainers = (breakpoints) => {
  return Object.entries(breakpoints || {}).reduce(
    (result, [key, breakpoint]) => {
      if (breakpoint.type !== "container") return result;
      result[key] = {
        min: breakpoint.min,
        max: breakpoint.max
      };
      return result;
    },
    {}
  );
};
const getMedias = (breakpoints) => {
  return Object.entries(breakpoints || {}).reduce(
    (result, [key, breakpoint]) => {
      if (breakpoint.type !== "media") return result;
      const parts = [];
      const min = "min" in breakpoint ? breakpoint.min : void 0;
      const max = "max" in breakpoint ? breakpoint.max : void 0;
      if (min !== void 0) parts.push(`(min-width: ${min}px)`);
      if (max !== void 0) parts.push(`(max-width: ${max}px)`);
      const query2 = parts.join(" and ");
      if (query2) result[key] = query2;
      return result;
    },
    {}
  );
};
const matchContainer = (element, container) => {
  const getData = () => {
    if (element[CONTAINER_DATA]) return element[CONTAINER_DATA];
    const listeners = /* @__PURE__ */ new Set();
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
    const matches = (container.min === void 0 || width >= container.min) && (container.max === void 0 || width <= container.max);
    return matches;
  };
  const addEventListener = (_type, listener) => {
    getData().listeners.add(listener);
  };
  const removeEventListener = (_type, listener) => {
    const data = getData();
    data.listeners.delete(listener);
    if (data.listeners.size !== 0) return;
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
    const DISPOSERS = /* @__PURE__ */ Symbol();
    const breakpoints = getConfig(getNamespace(target) || "").breakpoints || {};
    const containers = getContainers(breakpoints);
    const medias = getMedias(breakpoints);
    wrapMethod(
      "after",
      target,
      LIFECYCLE_UPDATE,
      function(states) {
        if (!states.has(key)) return;
        this[DISPOSERS] ??= /* @__PURE__ */ new Map();
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
          if (scheduled) return;
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
          if (activeKeys.delete(overrideKey)) continue;
          const breakpoint = breakpoints[overrideKey];
          if (!breakpoint) continue;
          switch (breakpoint.type) {
            case "container": {
              const container = containers[overrideKey];
              if (!container) break;
              const containerQueryList = matchContainer(host(this), container);
              const change = () => {
                for (const containerKey of containerKeys) {
                  if (matchContainer(host(this), containers[containerKey]).matches) {
                    apply(containerKey);
                  }
                }
                apply();
              };
              containerQueryList.addEventListener("change", change);
              const disposer = () => {
                containerQueryList.removeEventListener("change", change);
              };
              disposers.set(overrideKey, disposer);
              if (!containerQueryList.matches) break;
              change();
              break;
            }
            case "media": {
              const media = medias[overrideKey];
              if (!media) break;
              const mediaQueryList = window.matchMedia(media);
              const change = () => {
                for (const mediaKey of mediaKeys) {
                  if (window.matchMedia(medias[mediaKey]).matches) {
                    apply(mediaKey);
                  }
                }
                apply();
              };
              mediaQueryList.addEventListener("change", change);
              const disposer = () => {
                mediaQueryList.removeEventListener("change", change);
              };
              disposers.set(overrideKey, disposer);
              if (!mediaQueryList.matches) break;
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
      }
    );
    wrapMethod("after", target, LIFECYCLE_DISCONNECTED, function() {
      this[DISPOSERS] ??= /* @__PURE__ */ new Map();
      const disposers = this[DISPOSERS];
      disposers.forEach((disposer) => {
        disposer();
      });
      disposers.clear();
    });
  };
}
function Property(options) {
  return (target, key, descriptor) => {
    const KEY2 = /* @__PURE__ */ Symbol();
    const LOCKED = /* @__PURE__ */ Symbol();
    const attribute = options?.attribute || kebabCase(key);
    const originalSetter = descriptor?.set;
    target.constructor["observedAttributes"] ||= [];
    target.constructor["observedAttributes"].push(attribute);
    function get() {
      return this[KEY2];
    }
    function set(value) {
      const previous = this[KEY2];
      const next = value;
      if (!originalSetter && next === previous) return;
      if (originalSetter) {
        originalSetter.call(this, next);
      } else {
        this[KEY2] = next;
      }
      requestUpdate(this, key, previous, (skipped) => {
        if (skipped) return;
        if (!options?.reflect) return;
        this[LOCKED] = true;
        updateAttribute(this, attribute, next);
        this[LOCKED] = false;
      });
    }
    if (originalSetter) {
      descriptor.set = set;
    }
    if (!descriptor) {
      defineProperty(target, key, { configurable: true, get, set });
    }
    defineProperty(target, `RAW:${attribute}`, {
      set(value) {
        if (!this[LOCKED]) {
          try {
            this[key] = toProperty(value, options?.type);
          } catch {
          }
        }
      }
    });
    wrapMethod("before", target, LIFECYCLE_CONNECTED, function() {
      this[API_DEFAULTS] ||= {};
      this[API_DEFAULTS][key] = this[key];
    });
    wrapMethod("before", target, LIFECYCLE_CONSTRUCTED, function() {
      const get2 = () => {
        if (descriptor && !descriptor.get) {
          throw new Error(`Property '${key}' does not have a getter. Unable to retrieve value.`);
        }
        return this[key];
      };
      const set2 = (value) => {
        if (descriptor && !descriptor.set) {
          throw new Error(`Property '${key}' does not have a setter. Unable to assign value.`);
        }
        try {
          ensureIsType(value, options?.type);
          this[key] = value;
        } catch {
        }
      };
      defineProperty(host(this), key, { configurable: true, get: get2, set: set2 });
    });
    if (options?.reflect && descriptor?.get) {
      wrapMethod("before", target, LIFECYCLE_UPDATED, function() {
        this[LOCKED] = true;
        updateAttribute(this, attribute, this[key]);
        this[LOCKED] = false;
      });
    }
  };
}
function Query(selectors) {
  return toDecorator(query, selectors);
}
function QueryAll(selectors) {
  return toDecorator(queryAll, selectors);
}
function Slots() {
  return toDecorator(slots);
}
function State() {
  return (target, key) => {
    const KEY2 = /* @__PURE__ */ Symbol();
    const name = String(key);
    defineProperty(target, key, {
      enumerable: true,
      configurable: true,
      get() {
        return this[KEY2];
      },
      set(next) {
        const previous = this[KEY2];
        if (next === previous) return;
        this[KEY2] = next;
        requestUpdate(this, name, previous);
      }
    });
  };
}
function Style() {
  return (target, key) => {
    const KEY2 = /* @__PURE__ */ Symbol();
    const SHEET = /* @__PURE__ */ Symbol();
    const LAST = /* @__PURE__ */ Symbol();
    wrapMethod("before", target, LIFECYCLE_UPDATED, function() {
      applyStyle(this, this[key]);
    });
    defineProperty(target, key, {
      enumerable: true,
      configurable: true,
      get() {
        return this[KEY2];
      },
      set(next) {
        const previous = this[KEY2];
        if (next === previous) return;
        this[KEY2] = next;
        applyStyle(this, next);
      }
    });
    const applyStyle = (instance, input) => {
      const adoptedStyleSheets = shadowRoot(instance)?.adoptedStyleSheets;
      if (!adoptedStyleSheets) return;
      let sheet = instance[SHEET];
      if (!sheet) {
        sheet = new CSSStyleSheet();
        instance[SHEET] = sheet;
        adoptedStyleSheets.push(sheet);
      }
      const update = (value2) => (result) => {
        if (value2 && value2 !== instance[LAST]) return;
        sheet.replaceSync(toCssString(result));
        instance[LAST] = void 0;
      };
      const value = typeof input === "function" ? input.call(instance) : input;
      if (value instanceof Promise) {
        instance[LAST] = value;
        value.then(update(value)).catch((error) => {
          throw new Error("Style promise failed", { cause: error });
        });
      } else {
        update()(value);
      }
    };
  };
}
const toCssString = (input) => {
  if (typeof input === "string") {
    return input.trim();
  }
  if (Array.isArray(input)) {
    return input.map((item) => toCssString(item)).filter(Boolean).join("\n");
  }
  if (input === null) return "";
  if (typeof input !== "object") return "";
  let result = "";
  for (const key of Object.keys(input)) {
    const value = input[key];
    const ignore = [null, void 0, false].includes(value);
    if (ignore) continue;
    const cssKey = key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
    if (typeof value === "object") {
      result += `${cssKey} {${toCssString(value)}}`;
    } else {
      result += `${cssKey}: ${value};`;
    }
  }
  return result;
};
function Variant() {
  return (target, key) => {
    wrapMethod(
      "after",
      target,
      LIFECYCLE_UPDATE,
      function(states) {
        if (!states.has(key)) return;
        const namespace = getNamespace(target) || "";
        const tag = getTag(this) || "";
        const properties = getConfig(namespace).elements?.[tag]?.variants?.[this[key]]?.properties;
        if (!properties) return;
        const defaults = Object.assign({}, this[API_DEFAULTS], properties);
        delete defaults[key];
        Object.assign(this, defaults);
      }
    );
  };
}
function Watch(keys, immediate) {
  return (target, key) => {
    const all = [keys].flat().filter((item) => item);
    wrapMethod(
      "after",
      target,
      LIFECYCLE_UPDATED,
      function(states) {
        if (!immediate && !this[API_RENDER_COMPLETED]) return;
        states.forEach((previous, item) => {
          if (all.length && !all.includes(item)) return;
          this[key](this[item], previous, item);
        });
      }
    );
  };
}
export {
  Bind,
  Consumer,
  Debounce,
  Direction,
  Element,
  Event,
  Host,
  IsRTL,
  Listen,
  Method,
  Overrides,
  Property,
  Provider,
  Query,
  QueryAll,
  Slots,
  State,
  Style,
  Variant,
  Watch,
  classes,
  direction,
  dispatch,
  getConfig,
  getConfigCreator,
  host,
  isCSSColor,
  isCSSUnit,
  isRTL,
  off,
  on,
  query,
  queryAll,
  setConfig,
  setConfigCreator,
  slots
};
