export const toUnit = (input, unit = 'px') => {
    if (input == null || input === '')
        return undefined;
    if (isNaN(+input))
        return String(input);
    return `${Number(input)}${unit}`;
};
