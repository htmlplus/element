import fs from 'fs-extra';
import path from 'path';

import {
  TransformerPlugin,
  TransformerPluginContext,
  TransformerPluginGlobal
} from '../transformer.types.js';

export const README_OPTIONS: Partial<ReadmeOptions> = {
  source(context) {
    return path.join(context.directoryPath!, `${context.fileName}.md`);
  }
};

export interface ReadmeOptions {
  source?: (context: TransformerPluginContext) => string;
}

export const readme = (options?: ReadmeOptions): TransformerPlugin => {
  const name = 'readme';

  options = Object.assign({}, README_OPTIONS, options);

  const finish = (global: TransformerPluginGlobal) => {
    for (const context of global.contexts) {
      context.readmePath = options!.source!(context);

      if (!context.readmePath) continue;

      if (!fs.existsSync(context.readmePath)) continue;

      context.readmeContent = fs.readFileSync(context.readmePath, 'utf8');

      context.readmeExtension = path.extname(context.readmePath);

      context.readmeName = path.basename(context.readmePath, context.readmeExtension);
    }
  };

  return { name, finish };
};
