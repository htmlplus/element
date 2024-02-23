import { kebabCase } from 'change-case';

/**
 * Converts a JavaScript object containing CSS styles to a CSS string.
 */
export const styles = (input: object): string => {
  return Object.keys(input)
    .filter((key) => input[key] !== undefined && input[key] !== null)
    .map((key) => `${key.startsWith('--') ? '--' : ''}${kebabCase(key)}: ${input[key]}`)
    .join('; ');
};
