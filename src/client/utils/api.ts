import * as CONSTANTS from '../../configs/constants.js';

export interface Api {
  ready: boolean;
  host(): HTMLElement;
  request(states?): Promise<boolean>;
}

export const api = (target): Api => target[CONSTANTS.TOKEN_API];
