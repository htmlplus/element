import * as CONSTANTS from '../../constants/index.js';
import { PlusElement } from '../../types';

// TODO
export const getMembers = (
  target: PlusElement
): {
  [member: string]: {
    [CONSTANTS.STATIC_MEMBERS_INITIALIZER]?: any;
    [CONSTANTS.STATIC_MEMBERS_TYPE]?: any;
  };
} => {
  return target.constructor[CONSTANTS.STATIC_MEMBERS] || target[CONSTANTS.STATIC_MEMBERS] || {};
};
