import { merge } from './merge.js';
let defaults = {
    element: {}
};
export const getConfig = (namespace, ...parameters) => {
    if (typeof window == 'undefined')
        return;
    let config = window[namespace];
    for (const parameter of parameters) {
        if (!config)
            break;
        config = config[parameter];
    }
    return config;
};
export const setConfig = (namespace, config, override) => {
    if (typeof window == 'undefined')
        return;
    window[namespace] = merge({}, defaults, override ? {} : window[namespace], config);
};
