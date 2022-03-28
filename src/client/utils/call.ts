import { PlusElement } from '../../types/index.js';

export const call = (target: PlusElement, key: string, ...args: Array<any>): any => {
  return target[key]?.call(target, ...args);
};
