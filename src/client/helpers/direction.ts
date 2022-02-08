import { Direction } from '../../types';
import { host } from '../utils';

export const direction = (target): Direction => {
  return getComputedStyle(host(target)).getPropertyValue('direction').toLowerCase() as Direction;
};
