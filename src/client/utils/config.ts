import { merge } from './merge.js';

interface Options {
  component?: {
    [key: string]: {
      property?: {
        [key: string]: any;
      };
    };
  };
}

let defaults: Options = {
  component: {}
};

export const getConfig = (namespace: string, ...parameters: string[]): any => {
  if (typeof window == 'undefined') return;

  let config = window[namespace];

  for (const parameter of parameters) {
    if (!config) break;
    config = config[parameter];
  }

  return config;
};

export const setConfig = (namespace: string, config: Options, override?: boolean) => {
  if (typeof window == 'undefined') return;
  window[namespace] = merge({}, defaults, override ? {} : window[namespace], config);
};
