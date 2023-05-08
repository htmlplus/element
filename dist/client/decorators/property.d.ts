import { PlusElement } from '../../types';
export interface PropertyOptions {
    /**
     * Whether property value is reflected back to the associated attribute. default is `false`.
     */
    reflect?: boolean;
    /**
     * TODO
     */
    type?: number;
}
export declare function Property(options?: PropertyOptions): (target: PlusElement, propertyKey: PropertyKey) => void;
