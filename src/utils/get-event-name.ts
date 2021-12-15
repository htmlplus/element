export const getEventName = (input: string): string => {

    if (!input) return input;

    return input.substr(2).toLowerCase();
}