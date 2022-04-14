import * as CONSTANTS from '../../constants/index.js';
import { PlusElement } from '../../types/index.js';

export const isReady = (target: PlusElement): boolean => {
  return target[CONSTANTS.API_READY];
};
