import { DecoratorSetup, decorator } from '../utils/index.js';

export function Bind() {
  function setup(target: Object, propertyKey: PropertyKey, descriptor: PropertyDescriptor) {
    return {
      type: 'method',
      configurable: true,
      get() {
        const value = descriptor.value!.bind(this);
        Object.defineProperty(this, propertyKey, {
          value,
          configurable: true,
          writable: true
        });
        return value;
      }
    };
  }
  return decorator(setup as DecoratorSetup);
}
