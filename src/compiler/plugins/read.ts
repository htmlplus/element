import fs from 'fs-extra';

import { Context } from '../../types';

export const READ_OPTIONS: Partial<ReadOptions> = {
  encoding: 'utf8'
};

export type ReadOptions = {
  encoding: BufferEncoding;
  flag?: string | undefined;
};

export const read = (options?: ReadOptions) => {
  const name = 'read';

  options = Object.assign({}, READ_OPTIONS, options);

  const next = (context: Context) => {
    context.fileContent = context.fileContent ?? fs.readFileSync(context.filePath!, options);
  };

  return { name, next };
};
