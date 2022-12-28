import fs from 'fs-extra';
import path from 'path';

import { Context, Global, Plugin } from '../../types';

export const README_OPTIONS: Partial<ReadmeOptions> = {
  source(context) {
    return path.join(context.directoryPath!, `${context.fileName}.md`);
  }
};

export type ReadmeOptions = {
  source?: (context: Context) => string;
};

export const readme = (options: ReadmeOptions): Plugin => {
  const name = 'readme';

  options = Object.assign({}, README_OPTIONS, options);

  const finish = (global: Global) => {
    for (const context of global.contexts) {
      context.readmePath = options.source?.(context);

      if (!context.readmePath) continue;

      if (!fs.existsSync(context.readmePath)) continue;

      context.readmeContent = fs.readFileSync(context.readmePath, 'utf8');
    }
  };

  return { name, finish };
};
