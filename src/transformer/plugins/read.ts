import fs from 'fs-extra';

import { TransformerPlugin, TransformerPluginContext } from '../transformer.types';

export const READ_OPTIONS: Partial<ReadOptions> = {
  encoding: 'utf8'
};

export interface ReadOptions {
  encoding: BufferEncoding;
  flag?: string | undefined;
}

export const read = (options?: ReadOptions): TransformerPlugin => {
  const name = 'read';

  options = Object.assign({}, READ_OPTIONS, options);

  const run = (context: TransformerPluginContext) => {
    context.fileContent = context.fileContent ?? fs.readFileSync(context.filePath!, options);
  };

  return { name, run };
};
