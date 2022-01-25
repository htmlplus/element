import { PlusElement } from '../../types/index.js';
import { DecoratorSetup, decorator, defineProperty } from '../utils/index.js';

export function Method() {
  const setup: DecoratorSetup = (target: PlusElement, propertyKey: PropertyKey) => {
    return {
      type: 'method',
      onReady(host: HTMLElement) {
        defineProperty(host, propertyKey, {
          get: () => {
            return this[propertyKey].bind(this);
          }
        });
      }
    };
  };
  return decorator(setup);
}
