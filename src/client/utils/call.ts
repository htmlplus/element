export const call = (target: any, key: PropertyKey, ...parameters: Array<any>): any => {
  return target[key]?.call(target, ...parameters);
};
