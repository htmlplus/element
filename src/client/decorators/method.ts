import { PlusElement } from '../../types/index.js';
import { host } from '../helpers/index.js';
import { DecoratorSetup, decorator, defineProperty } from '../utils/index.js';

export function Method() {
  const setup: DecoratorSetup = (target: PlusElement, propertyKey: PropertyKey) => {
    return {
      onReady() {
        defineProperty(host(this), propertyKey, {
          get: () => {
            return this[propertyKey].bind(this);
          }
        });
      }
    };
  };
  return decorator(setup);
}
