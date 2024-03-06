/**
 * Converts a value to a unit.
 */
export const toUnit = (input: string | number, unit: string = 'px'): string => {
  if (input === null || input === undefined || input === '') return input;
  if (isNaN(+input)) return String(input);
  return Number(input) + unit;
};
