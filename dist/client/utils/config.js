import { isServer } from './isServer.js';
import { merge } from './merge.js';
const DEFAULTS = {
    element: {}
};
/**
 * TODO
 */
export const getConfig = (namespace) => (...keys) => {
    if (isServer())
        return;
    let config = window[namespace];
    for (const key of keys) {
        if (!config)
            break;
        config = config[key];
    }
    return config;
};
/**
 * TODO
 */
export const setConfig = (namespace) => (config, options) => {
    if (isServer())
        return;
    const previous = (options === null || options === void 0 ? void 0 : options.override) ? {} : window[namespace];
    window[namespace] = merge({}, DEFAULTS, previous, config);
};
