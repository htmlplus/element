import { host } from './host.js';

export const queryAll = (target, selector: string) => host(target)?.shadowRoot?.querySelectorAll(selector);
