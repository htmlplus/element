export const isEvent = (input: string) => {

  if (!input) return false;

  return !!input.match(/on[A-Z]\w+/g);
}