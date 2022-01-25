import * as CONSTANTS from '../../configs/constants.js';
import { ListenOptions } from '../../types/index.js';
import { host } from '../helpers/index.js';
import { defineMethod } from '../utils/index.js';

const defaults: ListenOptions = {
  target: 'host'
};

export function Listen(name: string, options: ListenOptions = defaults) {
  return function (target: Object, propertyKey: PropertyKey) {
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
      element(instance)?.addEventListener(name, target[propertyKey], options);
      return callback?.(...args);
    });

    defineMethod(target, CONSTANTS.TOKEN_LIFECYCLE_DISCONNECTED, function (instance, callback, args) {
      element(instance)?.removeEventListener(name, target[propertyKey], options);
      return callback?.(...args);
    });
  };
}
