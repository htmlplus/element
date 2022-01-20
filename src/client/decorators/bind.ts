import { DecoratorSetup, decorator, defineProperty } from '../utils/index.js';

export function Bind() {
  const setup: DecoratorSetup = (target: Object, propertyKey: PropertyKey, descriptor?: PropertyDescriptor) => {
    return {
      type: 'method',
      configurable: true,
      get() {
        const value = descriptor?.value!.bind(this);
        defineProperty(this, propertyKey, {
          value,
          configurable: true,
          writable: true
        });
        return value;
      }
    };
  };
  return decorator(setup);
}
