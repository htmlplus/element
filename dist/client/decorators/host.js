import { host, toDecorator } from '../utils/index.js';
/**
 * Indicates the host of the element.
 */
export function Host() {
    return toDecorator(host);
}
