import { Direction } from '../../types/index.js';
import { host } from './host.js';

export const direction = (target) => {
  return getComputedStyle(host(target)).getPropertyValue('direction').toLowerCase() as Direction;
};
