import * as CONSTANTS from '../../configs/constants.js';
import { Api } from '../../types/index.js';

export const api = (target) => {

  const defaults: Api = {
    ready: false,
    host() {
      throw new Error('Not Implemented');
    },
    property() {
      throw new Error('Not Implemented');
    },
    state() {
      throw new Error('Not Implemented');
    }
  }

  return Object.assign(defaults, target[CONSTANTS.TOKEN_API]) as Api;
}