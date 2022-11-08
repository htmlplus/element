export const appendToMethod = (
  target: any,
  propertyKey: PropertyKey,
  handler: (this, ...parameters: Array<any>) => void
) => {
  const callback = target[propertyKey];
  target[propertyKey] = function (...parameters) {
    handler.bind(this)(...parameters);
    return callback?.bind(this)(...parameters);
  };
};
