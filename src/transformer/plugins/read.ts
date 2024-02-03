import fs from 'fs-extra';
import path from 'path';

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
    if (!context.filePath) return;

    context.fileContent ??= fs.readFileSync(context.filePath, options);

    context.fileExtension = path.extname(context.filePath);

    context.fileName = path.basename(context.filePath, context.fileExtension);

    context.directoryPath = path.dirname(context.filePath);

    context.directoryName = path.basename(context.directoryPath);
  };

  return { name, run };
};
