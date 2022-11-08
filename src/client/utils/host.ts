import * as CONSTANTS from '../../constants/index.js';
import { PlusElement } from '../../types';

export const host = (target: PlusElement): HTMLElement => {
  return target[CONSTANTS.API_HOST]();
};
