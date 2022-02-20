import logUpdate from 'log-update';

import { Context, Plugin } from '../types/index.js';

const log = (namespace?: string, message?: string) => {
  logUpdate(`${new Date().toLocaleTimeString()} [@htmlplus/element]${namespace ? `[${namespace}]` : ''} ${message}`);
};

export default (...plugins: Array<Plugin>) => {
  let global = {
    contexts: {}
  };

  const start = async () => {
    log(undefined, 'Starting.');
    for (const plugin of plugins) {
      if (!plugin.start) continue;
      global = (await plugin.start(global)) || global;
      log(plugin.name, 'Started successfully.');
    }
  };

  const next = async (filePath: string) => {
    const key = filePath.split(/[\/|\\]/g).pop();

    let context: Context = {
      filePath
    };

    for (const plugin of plugins) {
      if (!plugin.next) continue;
      context = (await plugin.next(context, global)) || context;
      log(`${key}:${plugin.name}`, 'Executed successfully.');
    }

    log(key, 'Executed successfully.');

    global.contexts[filePath] = context;

    return context;
  };

  const finish = async () => {
    for (const plugin of plugins) {
      if (!plugin.finish) continue;
      global = (await plugin.finish(global)) || global;
      log(plugin.name, 'Finished successfully.');
    }
    log(undefined, 'Finished.');
  };

  return {
    start,
    next,
    finish
  };
};
