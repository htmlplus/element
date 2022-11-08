import * as CONSTANTS from '../../constants/index.js';
import { PlusElement } from '../../types';

export const getTag = (target: PlusElement): string | undefined => {
  return target.constructor[CONSTANTS.STATIC_TAG] ?? target[CONSTANTS.STATIC_TAG];
};
