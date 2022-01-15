import { ListenOptions } from '../../types/index.js';
import { DecoratorSetup, decorator } from '../utils/index.js';

// TODO
export function Listen(name: string, options: ListenOptions = {}) {
  function setup(target: Object, propertyKey: PropertyKey, descriptor: PropertyDescriptor) {
    return {};
  }
  return decorator(setup as DecoratorSetup);
}
