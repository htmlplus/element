// TODO: return type
export const typeOf = (input: any): string => {
  return Object
    .prototype
    .toString
    .call(input)
    .replace(/\[|\]|object| /g, '')
    .toLowerCase();
}