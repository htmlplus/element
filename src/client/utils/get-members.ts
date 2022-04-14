import * as CONSTANTS from '../../constants/index.js';
import { PlusElement } from '../../types/index.js';

export const getMembers = (target: PlusElement): any => {
  return target.constructor[CONSTANTS.STATIC_MEMBERS] ?? target[CONSTANTS.STATIC_MEMBERS];
};
