import { HTMLPlusElement } from '../../types/index.js';
/**
 * The class marked with this decorator is considered a
 * [Custom Element](https://mdn.io/using-custom-elements),
 * and its name, in kebab-case, serves as the element name.
 */
export declare function Element(): (constructor: HTMLPlusElement) => void;
