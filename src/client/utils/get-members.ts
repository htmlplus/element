import * as CONSTANTS from '../../configs/constants.js';
import { PlusElement } from '../../types/index.js';

export const getMembers = (target: PlusElement): any => {
  return target.constructor[CONSTANTS.STATIC_MEMBERS] ?? target[CONSTANTS.STATIC_MEMBERS];
};
