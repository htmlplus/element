import { isCSSColor } from './isCSSColor.js';

export const toCSSColor = (input: string): string | undefined => {
  return isCSSColor(input) ? input : undefined;
};
