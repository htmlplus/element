import fs from 'fs-extra';
import path from 'path';

import { TransformerPlugin, TransformerPluginContext } from '../transformer.types';

export const ASSETS_OPTIONS: Partial<AssetsOptions> = {
  once: true,
  destination(context) {
    return path.join('dist', 'assets', context.fileName!);
  },
  source(context) {
    return path.join(context.directoryPath!, 'assets');
  }
};

export interface AssetsOptions {
  once?: boolean;
  destination?: (context: TransformerPluginContext) => string;
  source?: (context: TransformerPluginContext) => string;
}

export const assets = (options?: AssetsOptions): TransformerPlugin => {
  const name = 'assets';

  options = Object.assign({}, ASSETS_OPTIONS, options);

  const sources = new Set<string>();

  const run = (context: TransformerPluginContext) => {
    context.assetsDestination = options!.destination?.(context);

    context.assetsSource = options!.source?.(context);

    if (!context.assetsSource) return;

    if (!fs.existsSync(context.assetsSource)) return;

    if (options!.once && sources.has(context.assetsSource)) return;

    sources.add(context.assetsSource);

    fs.copySync(context.assetsSource, context.assetsDestination);
  };

  return { name, run };
};
