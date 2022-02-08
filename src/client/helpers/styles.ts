import { paramCase } from 'change-case';

import { typeOf } from '../utils';

export const styles = (input: any): string => {
  switch (typeOf(input)) {
    case 'array':
      return input.join('; ');
    case 'object':
      return Object.keys(input)
        .map((key) => `${paramCase(key)}: ${input[key]}`)
        .join('; ');
    case 'string':
      return input;
    default:
      return '';
  }
};
