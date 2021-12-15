// TODO: input type
export const toNumber = (input: any): number => {

    // TODO
    if (isNaN(input)) return input;

    return parseFloat(input);
};