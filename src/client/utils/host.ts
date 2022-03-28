import * as CONSTANTS from '../../configs/constants.js';
import { PlusElement } from '../../types/index.js';

export const host = (target: PlusElement): HTMLElement => {
  return target[CONSTANTS.API_HOST]();
};
