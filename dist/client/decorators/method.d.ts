import { PlusElement } from '../../types';
/**
 * Provides a way to encapsulate functionality within an element
 * and invoke it as needed, both internally and externally.
 */
export declare function Method(): (target: PlusElement, propertyKey: PropertyKey) => void;
