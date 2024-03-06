export const call = (target: Object, key: PropertyKey, ...parameters: Array<any>): any => {
  return target[key]?.call(target, ...parameters);
};
