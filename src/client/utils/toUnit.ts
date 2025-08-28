/**
 * Converts a value to a unit.
 */
export const toUnit = (input: string | number, unit: string = 'px'): string => {
	if (input === null || input === undefined || input === '') return String(input);
	if (Number.isNaN(Number(input))) return String(input);
	return `${Number(input)}${unit}`;
};
