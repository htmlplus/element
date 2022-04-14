import * as CONSTANTS from '../../constants/index.js';
import { PlusElement } from '../../types/index.js';
import { call } from '../utils/call';
import { isReady } from '../utils/is-ready';
import { render } from '../utils/render';
import { task } from '../utils/task';

const targets = new Map();

export const request = (target: PlusElement, state?): Promise<boolean> => {
  if (!isReady(target)) return Promise.resolve(false);
  let run = targets.get(target);
  if (run) return run(state);
  run = task({
    canStart: (states, state) => {
      return /* hasChange */ true;
    },
    canRun: (states) => {
      return /* shouldUpdate */ true;
    },
    run: (states) => {
      call(target, CONSTANTS.LIFECYCLE_UPDATE, states);
      render(target);
      call(target, CONSTANTS.LIFECYCLE_UPDATED, states);
    }
  });
  targets.set(target, run);
  return run(state);
};
