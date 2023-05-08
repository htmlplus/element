import { host } from './host.js';
export const direction = (target) => {
    return getComputedStyle(host(target)).getPropertyValue('direction').toLowerCase();
};
