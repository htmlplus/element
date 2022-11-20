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

let options: Options = {};

export const getConfig = (...parameters: string[]): any => {
  let config = options;
  for (const parameter of parameters) {
    if (!config) break;
    config = config[parameter];
  }
  return config;
};

export const setConfig = (config: Options, override?: boolean) => {
  options = override ? merge({}, defaults, config) : merge({}, defaults, options, config);
};

const merge = (target, ...sources) => {
  for (const source of sources) {
    if (!source) continue;
    if (Array.isArray(source)) {
      target = source;
    } else {
      for (const key of Object.keys(source)) {
        if (source[key] instanceof Object) {
          target[key] = merge(target[key] || {}, source[key]);
        } else {
          target[key] = source[key];
        }
      }
    }
  }
  return target;
};
