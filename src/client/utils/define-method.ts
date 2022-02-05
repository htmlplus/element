// TODO: handler type
export const defineMethod = <T>(target: T, propertyKey: PropertyKey, handler) => {
  const callback = target[propertyKey];
  target[propertyKey] = function (...args) {
    return handler(this, callback?.bind(this), args);
  };
};
