import { HTMLPlusElement } from '../../types/index.js';
type Slots = {
    [key: string]: boolean;
};
/**
 * Returns the slots name.
 */
export declare const slots: (target: HTMLElement | HTMLPlusElement) => Slots;
export {};
