import * as CONSTANTS from '../../configs/constants.js';
import { ListenOptions, PlusElement } from '../../types/index.js';
import { host } from '../helpers/index.js';
import { defineMethod } from '../utils/index.js';
import { Bind } from './bind.js';

const defaults: ListenOptions = {
  target: 'host'
};

export function Listen(name: string, options: ListenOptions = defaults) {
  return function (target: PlusElement, propertyKey: PropertyKey, descriptor: PropertyDescriptor) {
    // TODO: types
    const element = (instance) => {
      switch (options.target) {
        case 'body':
          return window.document.body;
        case 'document':
          return window.document;
        case 'window':
          return window;
        case 'host':
          return host(instance);
      }
    };

    defineMethod(target, CONSTANTS.TOKEN_LIFECYCLE_CONNECTED, function (instance, callback, args) {
      element(instance)?.addEventListener(name, instance[propertyKey], options);
      return callback?.(...args);
    });

    defineMethod(target, CONSTANTS.TOKEN_LIFECYCLE_DISCONNECTED, function (instance, callback, args) {
      element(instance)?.removeEventListener(name, instance[propertyKey], options);
      return callback?.(...args);
    });

    return Bind()(target, propertyKey, descriptor);
  };
}
