import * as CONSTANTS from '../../constants/index.js';
import { HTMLPlusElement } from '../../types/index.js';

/**
 * Indicates the host of the element.
 */
export const host = (target: HTMLElement | HTMLPlusElement): HTMLElement => {
  try {
    return target[CONSTANTS.API_HOST]();
  } catch {
    return target as any;
  }
};
