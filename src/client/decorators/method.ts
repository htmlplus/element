import { DecoratorSetup, decorator } from '../utils/index.js';

export function Method() {
  function setup(target: Object, propertyKey: PropertyKey) {
    return {
      type: 'method',
      finisher(host: HTMLElement) {
        Object.defineProperty(host, propertyKey, {
          get: () => {
            return this[propertyKey].bind(this);
          }
        });
      }
    };
  }
  return decorator(setup as DecoratorSetup);
}
