import * as Utils from '../utils/index.js';
import { DecoratorSetup, decorator } from '../utils/index.js';

export function Watch(...keys: Array<string>) {
  return function (target: any, propertyKey: PropertyKey, descriptor: PropertyDescriptor) {
    // for (const key of keys) {
    //   const descriptor = Object.getOwnPropertyDescriptor(target, key) || {};
    //   const set = descriptor.set;
    //   descriptor.configurable = true;
    //   descriptor.set = function (input) {
    //     const value = this[key];
    //     set && set.bind(this)(input);
    //     if (input === value) return;
    //     const api = Utils.api(this);
    //     if (!api.ready) return;
    //     this[propertyKey](input, value, key);
    //   };
    //   Object.defineProperty(target, key, descriptor);
    // }
  };
  // const setup: DecoratorSetup = (target: Object, propertyKey: PropertyKey) => {
  //   return {};
  // };
  // return decorator(setup);
}
