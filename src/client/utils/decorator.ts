import { defineProperty } from './define-property.js';

export type DecoratorSetup = (
  target: Object,
  propertyKey: PropertyKey,
  descriptor?: PropertyDescriptor
) => DecoratorSetupReturn;

export type DecoratorSetupReturn = PropertyDescriptor & {
  type?: 'method' | 'property';
  onReady?(host: HTMLElement): void;
};

export const decorator = (setup: DecoratorSetup) => {
  return function (target: Object, propertyKey: PropertyKey, descriptor: PropertyDescriptor) {
    const key = String(propertyKey);

    const options = setup(target, propertyKey, descriptor);

    const isMethod = !descriptor || typeof descriptor.value !== 'function';

    switch (options.type) {
      case 'method':
        if (isMethod) throw new TypeError(`<${key}> is not a method!`);
        break;
      case 'property':
        if (!isMethod) throw new TypeError(`<${key}> is not a property!`);
        break;
    }

    defineProperty(target, propertyKey, options);

    // TODO
    if (!options.onReady) return;
    target['setup'] ??= [];
    target['setup'].push(options.onReady);
  };
};
