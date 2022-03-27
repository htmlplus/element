import * as CONSTANTS from '../../configs/constants.js';

export function onReady(target, callback: (this) => void): void {
  (target[CONSTANTS.API_SETUP] ??= []).push(callback);
}
