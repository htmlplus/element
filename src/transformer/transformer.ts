import ora from 'ora';
import path from 'path';

import * as CONSTANTS from '../constants/index.js';
import {
  TransformerPlugin,
  TransformerPluginContext,
  TransformerPluginGlobal
} from './transformer.types.js';

const logger = ora({
  color: 'yellow'
});

const log = (message, persist?) => {
  const content = `${new Date().toLocaleTimeString()} [${CONSTANTS.KEY}] ${message}`;

  const log = logger.start(content);

  if (!persist) return;

  log.succeed();
};

export const transformer = (...plugins: TransformerPlugin[]) => {
  let global: TransformerPluginGlobal = {
    contexts: []
  };

  const start = async () => {
    log(`Started.`, true);

    log(`${plugins.length} plugins detected.`, true);

    log(`Plugins are starting.`, true);

    for (const plugin of plugins) {
      if (!plugin.start) continue;

      log(`Plugin '${plugin.name}' is starting.`);

      global = (await plugin.start(global)) || global;

      log(`Plugin '${plugin.name}' started successfully.`);
    }

    log(`Plugins have been successfully started.`, true);
  };

  const run = async (filePath: string) => {
    const key = path.join(filePath).split(path.sep).pop();

    let context: TransformerPluginContext = {
      filePath
    };

    const parsed = path.parse(filePath);

    for (const plugin of plugins) {
      if (!plugin.run) continue;

      const source = path.join(parsed.dir).split(path.sep).slice(-2).concat(parsed.base).join('/');

      log(`Plugin '${plugin.name}' is executing on '${source}' file.`);

      try {
        context = (await plugin.run(context, global)) || context;
      } catch (error) {
        log(`Error in '${plugin.name}' plugin on '${source}' file.\n`, true);
        throw error;
      }

      global.contexts = global.contexts
        .filter((current) => {
          return current.filePath != context.filePath;
        })
        .concat(context);

      log(`Plugin '${plugin.name}' executed successfully on '${source}' file.`);
    }

    logger.stop();

    return context;
  };

  const finish = async () => {
    log(`Plugins are finishing.`, true);

    for (const plugin of plugins) {
      if (!plugin.finish) continue;

      log(`Plugin '${plugin.name}' is finishing.`);

      global = (await plugin.finish(global)) || global;

      log(`Plugin '${plugin.name}' finished successfully.`);
    }

    log(`Plugins have been successfully finished.`, true);

    log(`Finished.`, true);
  };

  return { global, start, run, finish };
};
