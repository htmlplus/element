import { host } from './host.js';

export const direction = (target) => getComputedStyle(host(target)).getPropertyValue('direction').toLowerCase();