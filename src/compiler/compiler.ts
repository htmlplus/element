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

      await plugin.start(global);

      log(`Plugin '${plugin.name}' started successfully.`);
    }

    log(`Plugins started successfully.`, true);
  };

  const next = async (filePath: string) => {
    const key = filePath.split(/[\/|\\]/g).pop();

    let context: Context = {
      filePath
    };

    for (const plugin of plugins) {
      if (!plugin.next) continue;

      log(`Plugin '${plugin.name}' is executing on '${path.basename(filePath)}' file.`);

      const output = await plugin.next(context, global);

      // TODO
      if (output) {
        context.outputs = (context.outputs ?? [])
          .filter((output) => {
            if (plugin.name != output.name) return true;
            if (plugin.options && plugin.options != output.options) return true;
          })
          .concat({
            name: plugin.name,
            options: plugin.options,
            output
          });
      }

      global.contexts = global.contexts.filter((current) => current.filePath != context.filePath).concat(context);

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

      await plugin.finish(global);

      log(`Plugin '${plugin.name}' finished successfully.`);
    }

    log(`Plugins finished successfully.`, true);

    log(`Finished.`, true);
  };

  return { start, next, finish };
};
