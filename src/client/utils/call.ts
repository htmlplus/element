export const call = (target: Object, key: PropertyKey, ...args: any[]): any => {
  return target[key]?.apply(target, args);
};
