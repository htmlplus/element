import * as CONSTANTS from '../../constants/index.js';
import { HTMLPlusElement } from '../../types/index.js';

export const getTag = (target: HTMLPlusElement): string | undefined => {
  return target.constructor[CONSTANTS.STATIC_TAG] ?? target[CONSTANTS.STATIC_TAG];
};
