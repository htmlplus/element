import ora from 'ora';
import path from 'path';

import { Context, Global, Plugin } from '../types';

const logger = ora({
  color: 'yellow'
});

const log = (message, persist?) => {
  logger.start(`${new Date().toLocaleTimeString()} [HTMLPLUS] ${message}`)[persist ? 'succeed' : '']?.();
};

export const compiler = (...plugins: Array<Plugin>) => {
  let global: Global = {
    contexts: []
  };

  log(`Starting...`, true);

  log(`${plugins.length} plugins found.`, true);

  const start = async () => {
    log(`Plugins are starting...`, true);

    for (const plugin of plugins) {
      if (!plugin.start) continue;

      log(`Plugin '${plugin.name}' is starting...`);

      global = (await plugin.start(global)) || global;

      log(`Plugin '${plugin.name}' started successfully.`);
    }

    log(`Plugins started successfully.`, true);
  };

  const run = async (filePath: string) => {
    const key = filePath.split(/[\/|\\]/g).pop();

    let context: Context = {
      filePath
    };

    for (const plugin of plugins) {
      if (!plugin.run) continue;

      log(`Plugin '${plugin.name}' is executing on '${path.basename(filePath)}' file.`);

      context = (await plugin.run(context, global)) || context;

      global.contexts = global.contexts
        .filter((current) => {
          return current.filePath != context.filePath;
        })
        .concat(context);

      log(`Plugin '${plugin.name}' executed successfully on '${path.basename(filePath)}' file.`);

      if (context.isInvalid) break;
    }

    logger.stop();

    if (context.isInvalid) log(`File '${key}' break executing because file is invalid.`, true);

    return context;
  };

  const finish = async () => {
    log(`Plugins are finishing...`, true);

    for (const plugin of plugins) {
      if (!plugin.finish) continue;

      log(`Plugin '${plugin.name}' is finishing...`);

      global = (await plugin.finish(global)) || global;

      log(`Plugin '${plugin.name}' finished successfully.`);
    }

    log(`Plugins finished successfully.`, true);

    log(`Finished.`, true);
  };

  return { start, run, finish };
};
