import * as CONSTANTS from '../../configs/constants.js';
import { PlusElement } from '../../types/index.js';

export function onReady(target: PlusElement, callback: (this) => void): void {
  (target[CONSTANTS.API_SETUP] ??= []).push(callback);
}
