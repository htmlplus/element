import * as CONSTANTS from '../../configs/constants.js';
import { PlusElement } from '../../types/index.js';

export const getStyles = (target: PlusElement): string | undefined => {
  return target.constructor[CONSTANTS.STATIC_STYLES] ?? target[CONSTANTS.STATIC_STYLES];
};
