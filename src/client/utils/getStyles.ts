import * as CONSTANTS from '../../constants/index.js';
import { PlusElement } from '../../types';

export const getStyles = (target: PlusElement): string | undefined => {
  return target.constructor[CONSTANTS.STATIC_STYLES] ?? target[CONSTANTS.STATIC_STYLES];
};
