import { host } from './host.js';
const outsides = [];
/**
 * TODO
 */
export const dispatch = (target, type, eventInitDict) => {
    const event = new CustomEvent(type, eventInitDict);
    host(target).dispatchEvent(event);
    return event;
};
/**
 * TODO
 */
export const on = (target, type, handler, options) => {
    const element = host(target);
    if (type != 'outside') {
        return element.addEventListener(type, handler, options);
    }
    const callback = (event) => {
        !event.composedPath().some((item) => item == element) && handler(event);
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
export const off = (target, type, handler, options) => {
    const element = host(target);
    if (type != 'outside') {
        return element.removeEventListener(type, handler, options);
    }
    const index = outsides.findIndex((outside) => {
        return outside.element == element && outside.handler == handler && outside.options == options;
    });
    const outside = outsides[index];
    if (!outside)
        return;
    off(document, outside.type, outside.callback, outside.options);
    outsides.splice(index, 1);
};
