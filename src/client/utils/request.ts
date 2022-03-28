import * as CONSTANTS from '../../configs/constants.js';
import { call, render, task } from '../utils/index.js';

const targets = new Map();

export const request = (target, state?): Promise<boolean> => {
  if (!target[CONSTANTS.API_READY]) return Promise.resolve(false);
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
