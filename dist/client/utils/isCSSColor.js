/**
 * Determines whether the given input string is a valid
 * [CSS Color](https://mdn.io/color-value) or not.
 */
export const isCSSColor = (input) => {
    const option = new Option();
    option.style.color = input;
    return option.style.color !== '';
};
