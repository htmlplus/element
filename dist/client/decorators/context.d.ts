import { HTMLPlusElement } from '../../types/index.js';
export declare function Provider(namespace: string): (target: HTMLPlusElement, key: PropertyKey, descriptor: PropertyDescriptor) => void;
export declare function Consumer(namespace: string): (target: HTMLPlusElement, key: PropertyKey) => void;
