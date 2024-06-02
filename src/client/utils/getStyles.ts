import * as CONSTANTS from '../../constants/index.js';
import { HTMLPlusElement } from '../../types/index.js';

export const getStyles = (target: HTMLPlusElement): string | undefined => {
  return target.constructor[CONSTANTS.STATIC_STYLE] ?? target[CONSTANTS.STATIC_STYLE];
};
