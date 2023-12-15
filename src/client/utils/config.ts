import { merge } from './merge.js';

let defaults: Config = {
  element: {}
};

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

export const getConfig = (namespace: string, ...parameters: string[]): any => {
  if (typeof window == 'undefined') return;

  let config = window[namespace];

  for (const parameter of parameters) {
    if (!config) break;
    config = config[parameter];
  }

  return config;
};

export const setConfig = (namespace: string, config: Config, override?: boolean) => {
  if (typeof window == 'undefined') return;
  window[namespace] = merge({}, defaults, override ? {} : window[namespace], config);
};
