import { HTMLPlusElement } from '../../types/index.js';
/**
 * Applying this decorator to any `class property` will trigger the
 * element to re-render upon the desired property changes.
 */
export declare function State(): (target: HTMLPlusElement, key: PropertyKey) => void;
