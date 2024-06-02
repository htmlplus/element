import { isServer } from './isServer.js';
import { merge } from './merge.js';
const DEFAULTS = {
    element: {}
};
/**
 * TODO
 */
export const getConfig = (...keys) => {
    if (isServer())
        return;
    let config = window[`$htmlplus$`];
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
export const setConfig = (config, options) => {
    if (isServer())
        return;
    const previous = options?.override ? {} : window[`$htmlplus$`];
    window[`$htmlplus$`] = merge({}, DEFAULTS, previous, config);
};
