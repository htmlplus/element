import { PlusElement } from '../../types/index.js';
import { DecoratorSetup, decorator, defineProperty } from '../utils/index.js';

export function Bind() {
  const setup: DecoratorSetup = (target: PlusElement, propertyKey: PropertyKey, descriptor?: PropertyDescriptor) => {
    return {
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
