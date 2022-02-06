// TODO: handler type
export const appendToMethod = <T>(target: T, propertyKey: PropertyKey, handler: (this, args: Array<any>) => void) => {
  const callback = target[propertyKey];
  target[propertyKey] = function () {
    handler.bind(this)(Array.from(arguments));
    return callback?.bind(this)(arguments)
  };
};
