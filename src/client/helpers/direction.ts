import { Direction } from '../../types/index.js';
import { host } from '../utils/index.js';

export const direction = (target): Direction => {
  return getComputedStyle(host(target)).getPropertyValue('direction').toLowerCase() as Direction;
};
