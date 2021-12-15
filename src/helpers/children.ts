import { host } from './host.js';

export const children = (target) => Array.from(host(target).children);