import * as CONSTANTS from '../../constants/index.js';
import { PlusElement } from '../../types/index.js';

export function onReady(target: PlusElement, callback: (this) => void): void {
  (target[CONSTANTS.API_SETUP] ??= []).push(callback);
}
