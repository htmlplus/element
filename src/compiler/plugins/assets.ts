import fs from 'fs-extra';
import path from 'path';

import { Context, Plugin } from '../../types';

export const ASSETS_OPTIONS: Partial<AssetsOptions> = {
  once: true,
  destination(context) {
    return `assets/${context.fileName}`;
  },
  source(context) {
    return path.join(context.directoryPath!, 'assets');
  }
};

export type AssetsOptions = {
  once?: boolean;
  destination: (context: Context) => string;
  source?: (context: Context) => string;
};

export const assets = (options: AssetsOptions): Plugin => {
  const name = 'assets';

  options = Object.assign({}, ASSETS_OPTIONS, options);

  const sources = new Set<string>();

  const run = (context: Context) => {
    const source = options.source?.(context);

    if (!source) return;

    if (!fs.existsSync(source)) return;

    if (options.once) {
      if (sources.has(source)) return;
      sources.add(source);
    }

    const destination = options.destination?.(context);

    fs.copySync(source, destination);

    context.assets = source;
  };

  return { name, run };
};
