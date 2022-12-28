import fs from 'fs-extra';

import { Context, Plugin } from '../../types';

export const READ_OPTIONS: Partial<ReadOptions> = {
  encoding: 'utf8'
};

export type ReadOptions = {
  encoding: BufferEncoding;
  flag?: string | undefined;
};

export const read = (options?: ReadOptions): Plugin => {
  const name = 'read';

  options = Object.assign({}, READ_OPTIONS, options);

  const run = (context: Context) => {
    context.fileContent = context.fileContent ?? fs.readFileSync(context.filePath!, options);
  };

  return { name, run };
};
