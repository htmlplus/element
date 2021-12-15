export const isEvent = (input: string): boolean => {

  if (!input) return false;

  return !!input.match(/on[A-Z]\w+/g);
}