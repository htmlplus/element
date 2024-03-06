import * as CONSTANTS from '../../constants/index.js';
import { HTMLPlusElement } from '../../types';
import { appendToMethod, dispatch, host } from '../utils/index.js';

/**
 * TODO
 * @param namespace
 */
export function Consumer(namespace: string) {
  return function (target: HTMLPlusElement, key: PropertyKey) {
    appendToMethod(target, CONSTANTS.LIFECYCLE_CONSTRUCTED, function () {
      const options: CustomEventInit = {
        bubbles: true
      };

      options.detail = (state: any) => {
        this[key] = state;

        const successful = !!host(this).parentElement;

        return successful;
      };

      dispatch(this, `internal:context:${namespace}`, options);
    });
  };
}
