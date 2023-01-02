import * as CONSTANTS from '../../constants/index.js';
import { PlusElement } from '../../types';

export const addMember = (target: PlusElement, key: string, data: any) => {
  target[CONSTANTS.STATIC_MEMBERS] ||= {};
  target[CONSTANTS.STATIC_MEMBERS][key] = data;
};
