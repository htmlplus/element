import { HTMLPlusElement } from '../../types';
/**
 * The configuration for property decorator.
 */
export interface PropertyOptions {
    /**
     * Whether property value is reflected back to the associated attribute. default is `false`.
     */
    reflect?: boolean;
    /**
     * Do not set the value to this property. This value is automatically set during transforming.
     */
    type?: number;
}
/**
 * Creates a reactive property, reflecting a corresponding attribute value,
 * and updates the element when the property is set.
 */
export declare function Property(options?: PropertyOptions): (target: HTMLPlusElement, key: PropertyKey, descriptor?: PropertyDescriptor) => void;
