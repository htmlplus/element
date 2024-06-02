import { host } from './host.js';
export const shadowRoot = (target) => {
    return host(target)?.shadowRoot;
};
