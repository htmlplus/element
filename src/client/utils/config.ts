import { merge } from './merge.js';

/**
 * TODO
 */
export interface Config {
  breakpoints?: {
    [key: string]: {
      type: 'container' | 'media';
      min?: number;
      max?: number;
    };
  };
  event?: {
    resolver?: (parameters: any) => CustomEvent | undefined;
  };
  assets?: {
    [key: string]: any;
  };
  elements?: {
    [key: string]: {
      properties?: {
        [key: string]: {
          default?: unknown;
        };
      };
      // slots?: {
      //   [key: string]: any;
      // };
      // variants?: {
      //   [key: string]: {
      //     properties: {
      //       [key: string]: any;
      //     };
      //     slots?: {
      //       [key: string]: any;
      //     };
      //   }
      // };
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
export const getConfig = (namespace: string): Config => {
  return globalThis[`$htmlplus:${namespace}$`] || {};
};

/**
 * TODO
 */
export const getConfigCreator = (namespace: string) => () => {
  return getConfig(namespace);
};

/**
 * TODO
 */
export const setConfig = (namespace: string, config: Config, options?: ConfigOptions): void => {
  const previous = options?.override ? {} : globalThis[`$htmlplus:${namespace}$`];

  const next = merge({}, previous, config);

  globalThis[`$htmlplus:${namespace}$`] = next;
};

/**
 * TODO
 */
export const setConfigCreator =
  (namespace: string) => (config: Config, options?: ConfigOptions) => {
    return setConfig(namespace, config, options);
  };
