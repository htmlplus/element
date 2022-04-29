import fs from 'fs';
import path from 'path';

import { Context } from '../../types/index.js';

const defaults: StyleOptions = {
  extensions: ['scss', 'less', 'styl', 'css'],
  directory(context: Context) {
    return context.directoryPath!;
  },
  filename(context: Context) {
    return context.fileName!;
  }
};

export type StyleOptions = {
  extensions?: Array<'scss' | 'less' | 'styl' | 'css'>;
  directory?: (context: Context) => string;
  filename?: (context: Context) => string;
};

export const style = (options: StyleOptions) => {
  const name = 'Auto dependency resolver';

  options = { ...defaults, ...options };

  const next = (context: Context) => {
    const filename = options.filename!(context);
    const directory = options.directory!(context);
    for (let extension of options.extensions!) {
      const stylePath = path.join(directory, `${filename}.${extension}`);
      if (!fs.existsSync(stylePath)) continue;
      context.stylePath = stylePath;
      break;
    }
  };

  return {
    name,
    next
  };
};
