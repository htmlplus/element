/**
 * Used to bind a method of a class to the current context,
 * making it easier to reference `this` within the method.
 */
export declare function Bind(): (target: Object, key: PropertyKey, descriptor: PropertyDescriptor) => {
    configurable: boolean;
    get(): any;
};
