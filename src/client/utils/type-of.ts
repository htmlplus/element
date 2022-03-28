type Types = 'array' | 'boolean' | 'function' | 'number' | 'object' | 'string';

export const typeOf = (input: any): Types => {
  return Object.prototype.toString
    .call(input)
    .replace(/\[|\]|object| /g, '')
    .toLowerCase() as any;
};
