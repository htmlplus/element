import { defineProperty } from './define-property.js';

export type DecoratorSetup = (
  target: Object,
  propertyKey: PropertyKey,
  descriptor?: PropertyDescriptor
) => DecoratorSetupReturn;

export type DecoratorSetupReturn = PropertyDescriptor & {
  onReady?(): void;
};

export const decorator = (setup: DecoratorSetup) => {
  return function (target: Object, propertyKey: PropertyKey, descriptor?: PropertyDescriptor) {
    const options = setup(target, propertyKey, descriptor);

    if (
      Object.keys(options).some((key) =>
        ['configurable', 'enumerable', 'value', 'writable', 'get', 'set'].includes(key)
      )
    )
      defineProperty(target, propertyKey, options);

    // TODO
    if (options.onReady) (target['setup'] ??= []).push(options.onReady);
  };
};
