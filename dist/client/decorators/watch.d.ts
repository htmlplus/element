import { PlusElement } from '../../types';
/**
 * Monitors `@Property` and `@State` to catch changes.
 * The decorated method will be invoked after any
 * changes with the `key`, `newValue`, and `oldValue` as parameters.
 * If the arguments aren't defined, all of the `@Property` and `@State` are considered.
 * @param keys Collection of `@Property` and `@State` names.
 * @param immediate Triggers the callback immediately after initialization.
 */
export declare function Watch(keys?: string | string[], immediate?: boolean): (target: PlusElement, propertyKey: PropertyKey) => void;
