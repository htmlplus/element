import logUpdate from 'log-update';
import * as path from 'path';
import { Context, Plugin } from '../types/index.js';

const log = (namespace: string, message?: string) => {
  logUpdate(`${new Date().toLocaleTimeString()} [${namespace}] ${message}`);
}

export const createCompiler = (...plugins: Array<Plugin>) => {

  const global = {
    contexts: {}
  }

  const start = async () => {

    console.log(`${new Date().toLocaleTimeString()} Starting.`);

    for (const plugin of plugins) {

      if (!plugin.start) continue;

      await plugin.start(global);

      log(plugin.name, 'Started successfully.');
    }
  }

  const next = async (filename: string) => {

    const key = filename.split(/[\/|\\]/g).pop();

    const directory = path.dirname(filename);

    let context: Context = {
      filename,
      directory,
      content: '',
      tag: '',
      members: [],
      states: [],
      properties: [],
      events: [],
      methods: [],
    }

    for (const plugin of plugins) {

      if (!plugin.next) continue;

      context = await plugin.next(context, global) || context;

      log(plugin.name, `[${key}] Executed successfully.`);
    }

    global.contexts[filename] = context;

    return context;
  }

  const finish = async () => {

    for (const plugin of plugins) {

      if (!plugin.finish) continue;

      await plugin.finish(global);

      log(plugin.name, 'Finished successfully.');
    }

    console.log(`${new Date().toLocaleTimeString()} Finished.`);
  }

  return {
    start,
    next,
    finish,
  }
}
