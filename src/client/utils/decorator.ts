export type DecoratorSetup = (
  target: Object,
  propertyKey: PropertyKey,
  descriptor?: PropertyDescriptor
) => DecoratorSetupReturn;

export type DecoratorSetupReturn = PropertyDescriptor & {
  type?: 'method' | 'property';
  finisher?(host: HTMLElement): void;
};

export const decorator = (setup: DecoratorSetup) => {
  return function (target: Object, propertyKey: PropertyKey, descriptor: PropertyDescriptor) {
    const options = setup(target, propertyKey, descriptor);

    if (options.type == 'method' && (!descriptor || typeof descriptor.value !== 'function'))
      throw new TypeError(`<${String(propertyKey)}> is not a method!`);

    Object.defineProperty(target, propertyKey, options);

    // TODO
    if (!options.finisher) return;
    target['setup'] = target['setup'] || [];
    target['setup'].push(options.finisher);
  };
};
