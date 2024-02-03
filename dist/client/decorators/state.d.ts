import { PlusElement } from '../../types';
/**
 * Applying this decorator to any `class property` will trigger the
 * element to re-render upon the desired property changes.
 */
export declare function State(): (target: PlusElement, propertyKey: PropertyKey) => void;
