export const toBoolean = (input: any): boolean => {
  if (input === '') return true;
  if (input === 'true') return true;
  if (input === true) return true;
  if (input === 'false') return false;
  if (input === false) return false;
  return true;
};
