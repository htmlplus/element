/**
 * Converts a value to a unit.
 */
export const toUnit = (input, unit = 'px') => {
    if (input === null || input === undefined || input === '')
        return input;
    if (isNaN(+input))
        return String(input);
    return Number(input) + unit;
};
