import { HTMLPlusElement } from '../../types';
/**
 * TODO
 * @param namespace
 */
export declare function Provider(namespace: string): (target: HTMLPlusElement, key: PropertyKey, descriptor: PropertyDescriptor) => void;
