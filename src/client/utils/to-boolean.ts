export const toBoolean = (input: any): boolean => {
  return ![undefined, null, false, 'false'].includes(input);
};
