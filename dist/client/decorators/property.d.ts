import { HTMLPlusElement } from '../../types/index.js';
/**
 * The configuration for property decorator.
 */
export interface PropertyOptions {
    /**
     * Specifies the name of the attribute related to the property.
     */
    attribute?: string;
    /**
     * Whether property value is reflected back to the associated attribute. default is `false`.
     */
    reflect?: boolean;
    /**
     * Specifies the property `type` and supports
     * [data types](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures).
     * If this value is not set, it will be set automatically during transforming.
     */
    type?: any;
}
/**
 * Creates a reactive property, reflecting a corresponding attribute value,
 * and updates the element when the property is set.
 */
export declare function Property(options?: PropertyOptions): (target: HTMLPlusElement, key: PropertyKey, descriptor?: PropertyDescriptor) => void;
