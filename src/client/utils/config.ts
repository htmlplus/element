import { isServer } from './isServer.js';
import { merge } from './merge.js';

const DEFAULTS: Config = {
  element: {}
};

/**
 * TODO
 */
export interface Config {
  event?: {
    resolver?: (parameters: any) => CustomEvent | undefined;
  };
  asset?: {
    [key: string]: any;
  };
  element?: {
    [key: string]: {
      property?: {
        [key: string]: any;
      };
    };
  };
}

/**
 * TODO
 */
export interface ConfigOptions {
  /**
   * TODO
   */
  force?: boolean;
  /**
   * TODO
   */
  override?: boolean;
}

/**
 * TODO
 */
export const getConfig = (...keys: string[]): any => {
  if (isServer()) return;

  let config = window[`$htmlplus$`];

  for (const key of keys) {
    if (!config) break;
    config = config[key];
  }

  return config;
};

/**
 * TODO
 */
export const setConfig = (config: Config, options?: ConfigOptions): void => {
  if (isServer()) return;

  const previous = options?.override ? {} : window[`$htmlplus$`];

  window[`$htmlplus$`] = merge({}, DEFAULTS, previous, config);
};
