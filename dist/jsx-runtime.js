import { Fragment as Fragment$1, createElement as createElement$1 } from "preact";
import { host } from "./client.js";
const LISTENERS = /* @__PURE__ */ Symbol();
function createElement(type, props, key) {
  const { children, value: instance, ...rest } = props || {};
  if (type !== "host") {
    return createElement$1(type, props, ...[children].flat(1));
  }
  if (!instance) {
    throw new Error("host tag requires `value` prop");
  }
  const element = host(instance);
  for (const key2 in rest) {
    const value = rest[key2];
    if (key2 === "className") {
      element.className = value;
    } else if (key2 === "style") {
      if (typeof value === "string") {
        element.style = value;
      } else {
        for (const key3 in value) {
          if (key3.startsWith("--")) {
            element.style.setProperty(key3, value[key3]);
          } else {
            element.style[key3] = value[key3];
          }
        }
      }
    } else if (key2.startsWith("on")) {
      const listeners = element[LISTENERS] ||= {};
      const event = key2.slice(2).toLowerCase();
      listeners[event]?.();
      element.addEventListener(event, value);
      listeners[event] = () => {
        element.removeEventListener(event, value);
      };
    } else {
      element.setAttribute(key2, value);
    }
  }
  return createElement(Fragment, { children, ...rest });
}
const Fragment = Fragment$1;
function jsx(type, props, key) {
  return createElement(type, props);
}
function jsxs(type, props, key) {
  return createElement(type, props);
}
function jsxDEV(type, props, key, isStatic, source, self) {
  props ||= {};
  if (source) {
    props.__source = source;
  }
  if (self) {
    props.__self = self;
  }
  return createElement(type, props);
}
export {
  Fragment,
  jsx,
  jsxDEV,
  jsxs
};
