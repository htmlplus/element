export const isEvent = (input: string) => !!input?.match(/on[A-Z]\w+/g);
