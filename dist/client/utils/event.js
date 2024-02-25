const outsides = [];
/**
 * TODO
 */
export const off = (target, type, handler, options) => {
    if (type != 'outside')
        return target.removeEventListener(type, handler, options);
    const index = outsides.findIndex((outside) => {
        return outside.target == target && outside.handler == handler && outside.options == options;
    });
    const outside = outsides[index];
    if (!outside)
        return;
    off(document, outside.type, outside.callback, outside.options);
    outsides.splice(index, 1);
};
/**
 * TODO
 */
export const on = (target, type, handler, options) => {
    if (type != 'outside')
        return target.addEventListener(type, handler, options);
    const callback = (event) => {
        !event.composedPath().some((item) => item == target) && handler(event);
    };
    type = 'ontouchstart' in window.document.documentElement ? 'touchstart' : 'click';
    on(document, type, callback, options);
    outsides.push({
        target,
        type,
        handler,
        options,
        callback
    });
};
