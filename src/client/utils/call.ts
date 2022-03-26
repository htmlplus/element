export const call = (target: any, key: string, ...args: Array<any>): any => {
  return target[key]?.call(target, ...args);
};
