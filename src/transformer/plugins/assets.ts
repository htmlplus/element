import fs from 'fs-extra';
import path from 'path';

import {
  TransformerPlugin,
  TransformerPluginContext,
  TransformerPluginGlobal
} from '../transformer.types.js';

export const ASSETS_OPTIONS: Partial<AssetsOptions> = {
  destination(context) {
    return path.join('dist', 'assets', context.fileName!);
  },
  source(context) {
    return path.join(context.directoryPath!, 'assets');
  }
};

export interface AssetsOptions {
  destination?: (context: TransformerPluginContext) => string;
  source?: (context: TransformerPluginContext) => string;
}

export const assets = (options?: AssetsOptions): TransformerPlugin => {
  const name = 'assets';

  options = Object.assign({}, ASSETS_OPTIONS, options);

  const finish = (global: TransformerPluginGlobal) => {
    for (const context of global.contexts) {
      context.assetsDestination = options!.destination!(context);

      context.assetsSource = options!.source!(context);

      if (!context.assetsSource) continue;

      if (!fs.existsSync(context.assetsSource)) continue;

      fs.copySync(context.assetsSource, context.assetsDestination);
    }
  };

  return { name, finish };
};
