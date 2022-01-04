export const toUnit = (input: string | number, unit: string = 'px') => {
  if (input == null || input === '') return undefined;

  if (isNaN(+input!)) return String(input);

  return `${Number(input)}${unit}`;
};
