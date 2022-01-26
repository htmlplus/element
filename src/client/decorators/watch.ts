import * as CONSTANTS from '../../configs/constants.js';
import { PlusElement } from '../../types/index.js';
import { DecoratorSetup, decorator, defineMethod } from '../utils/index.js';

export function Watch(...keys: Array<string>) {
  const setup: DecoratorSetup = (target: PlusElement, propertyKey: PropertyKey) => {
    return {
      type: 'method',
      onInit() {
        defineMethod(target, CONSTANTS.TOKEN_LIFECYCLE_UPDATED, function (instance, callback, args) {
          for (const key of keys) {
            // TODO
            // const value = this[key];
            // set && set.bind(this)(input);
            // if (input === value) return;
            // const api = Utils.api(this);
            // if (!api.ready) return;
            // this[propertyKey](input, value, key);
          }
          return callback?.(...args);
        });
      }
    };
  };
  return decorator(setup);
}
