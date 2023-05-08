export const toBoolean = (input) => {
    return ![undefined, null, false, 'false'].includes(input);
};
