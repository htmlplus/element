import fs from 'fs-extra';
import path from 'path';

import { TransformerPlugin, TransformerPluginContext } from '../transformer.types';

export const ASSETS_OPTIONS: Partial<AssetsOptions> = {
  once: true,
  destination(context) {
    return `assets/${context.fileName}`;
  },
  source(context) {
    return path.join(context.directoryPath!, 'assets');
  }
};

export interface AssetsOptions {
  once?: boolean;
  destination: (context: TransformerPluginContext) => string;
  source?: (context: TransformerPluginContext) => string;
}

export const assets = (options: AssetsOptions): TransformerPlugin => {
  const name = 'assets';

  options = Object.assign({}, ASSETS_OPTIONS, options);

  const sources = new Set<string>();

  const run = (context: TransformerPluginContext) => {
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
