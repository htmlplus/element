import { PlusElement } from '../../types';
import { getTag } from './getTag.js';

export const getNamespace = (instance: PlusElement) => {
  return getTag(instance)!.split('-')[0].toUpperCase();
};
