import { isServer } from './isServer.js';
import { merge } from './merge.js';

const DEFAULTS: Config = {
  element: {}
};

/**
 * TODO
 */
export interface Config {
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
export const getConfig =
  (namespace: string) =>
  (...keys: string[]): any => {
    if (isServer()) return;

    let config = window[namespace];

    for (const key of keys) {
      if (!config) break;
      config = config[key];
    }

    return config;
  };

/**
 * TODO
 */
export const setConfig =
  (namespace: string) =>
  (config: Config, options?: ConfigOptions): void => {
    if (isServer()) return;

    const previous = options?.override ? {} : window[namespace];

    window[namespace] = merge({}, DEFAULTS, previous, config);
  };
