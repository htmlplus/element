import { kebabCase } from 'change-case';
import { host } from './host.js';
export const updateAttribute = (target, key, value) => {
    const element = host(target);
    const name = kebabCase(key);
    if ([undefined, null, false].includes(value)) {
        return element.removeAttribute(name);
    }
    element.setAttribute(name, value === true ? '' : value);
};
