export const isEvent = (input: string): boolean => {
  return !!input?.match(/on[A-Z]\w+/g);
};
