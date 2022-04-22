import logUpdate from 'log-update';

import { Context, Plugin } from '../types/index.js';

const log = (namespace?: string, message?: string, persist?: boolean) => {
  logUpdate(`${new Date().toLocaleTimeString()} [@htmlplus/element]${namespace ? `[${namespace}]` : ''} ${message}`);
  persist && logUpdate.done();
};

export default (...plugins: Array<Plugin>) => {
  let global = {
    contexts: {}
  };

  const start = async () => {
    log(undefined, 'Starting...', true);
    for (const plugin of plugins) {
      if (plugin.start) {
        global = (await plugin.start(global)) || global;
      }
      log(plugin.name, 'Started successfully.');
    }
    log(undefined, `${plugins.length} Plugins started successfully.`, true);
  };

  const next = async (filePath: string) => {
    const key = filePath.split(/[\/|\\]/g).pop();

    let context: Context = {
      filePath
    };

    log(`${key}`, 'Executing...');

    for (const plugin of plugins) {
      if (!plugin.next) continue;
      context = (await plugin.next(context, global)) || context;
      if (context.isInvalid) {
        break;
      }
    }

    log(key, 'Executed successfully.');

    global.contexts[filePath] = context;

    return context;
  };

  const finish = async () => {
    log(undefined, 'Finishing...', true);
    for (const plugin of plugins) {
      if (plugin.finish) {
        global = (await plugin.finish(global)) || global;
      }
      log(plugin.name, 'Finished successfully.');
    }
    log(undefined, `${plugins.length} Plugins finished successfully.`, true);
  };

  return {
    start,
    next,
    finish
  };
};
