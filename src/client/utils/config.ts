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

export const getConfig = (...parameters: string[]): any => {
  if (typeof window == 'undefined') return;

  let config = window['HTMLPLUS'];

  for (const parameter of parameters) {
    if (!config) break;
    config = config[parameter];
  }

  return config;
};

export const setConfig = (config: Options, override?: boolean) => {
  if (typeof window == 'undefined') return;
  window['HTMLPLUS'] = merge({}, defaults, override ? {} : window['HTMLPLUS'], config);
};

const merge = (target, ...sources) => {
  for (const source of sources) {
    if (!source) continue;
    if (Array.isArray(source)) {
      target = source;
    } else {
      for (const key of Object.keys(source)) {
        if (source[key] instanceof Object) {
          if (target[key] instanceof Object) {
            target[key] = merge(target[key], source[key]);
          } else {
            target[key] = source[key];
          }
        } else {
          target[key] = source[key];
        }
      }
    }
  }
  return target;
};
