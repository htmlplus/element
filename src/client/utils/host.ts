import * as CONSTANTS from '../../constants/index.js';
import { PlusElement } from '../../types';

/**
 * Indicates the host of the element.
 */
export const host = (target: PlusElement): HTMLElement => {
  return target[CONSTANTS.API_HOST]();
};
