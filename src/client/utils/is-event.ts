export const isEvent = (input: string): boolean => !!input?.match(/on[A-Z]\w+/g);
