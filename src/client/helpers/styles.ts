import { paramCase } from 'change-case';

import { typeOf } from '../utils/index.js';

export const styles = (input: any): string => {
  switch (typeOf(input)) {
    case 'array':
      return input.join('; ');
    case 'object':
      return Object.keys(input)
        .filter((key) => input[key] !== undefined && input[key] !== null)
        .map((key) => `${key.startsWith('--') ? '--' : ''}${paramCase(key)}: ${input[key]}`)
        .join('; ');
    case 'string':
      return input;
    default:
      return '';
  }
};
