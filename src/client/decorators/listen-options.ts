import { ListenOptions as ListenOptionsBase } from '../../types/index.js';
import { DecoratorSetup, decorator } from '../utils/index.js';

// TODO
export function ListenOptions(options: Omit<ListenOptionsBase, 'target'> = {}) {
  function setup(target: Object, propertyKey: PropertyKey, descriptor: PropertyDescriptor) {
    return {};
  }
  return decorator(setup as DecoratorSetup);
}
