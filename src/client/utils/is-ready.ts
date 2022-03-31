import * as CONSTANTS from '../../configs/constants.js';
import { PlusElement } from '../../types/index.js';

export const isReady = (target: PlusElement): boolean => {
  return target[CONSTANTS.API_READY];
};
