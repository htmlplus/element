import * as CONSTANTS from '../../configs/constants.js';
import { ListenOptions } from '../../types/index.js';
import { host } from '../helpers/index.js';

const defaults: ListenOptions = {
  target: 'host'
};

export function Listen(name: string, options: ListenOptions = defaults) {
  return function (target: Object, propertyKey: PropertyKey) {
    [
      [CONSTANTS.TOKEN_LIFECYCLE_CONNECTED, 'addEventListener'],
      [CONSTANTS.TOKEN_LIFECYCLE_DISCONNECTED, 'removeEventListener']
    ].forEach((item) => {
      const [lifecycle, property] = item;

      const callback = target[lifecycle];

      target[lifecycle] = function () {
        callback?.();

        let element;

        switch (options.target) {
          case 'body':
            element = window.document.body;
            break;
          case 'document':
            element = window.document;
            break;
          case 'window':
            element = window;
            break;
          case 'host':
            element = host(this);
            break;
        }

        element[property](name, target[propertyKey], options);
      };
    });
  };
}
