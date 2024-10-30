import fs from 'fs-extra';
import path from 'path';

import { TransformerPlugin, TransformerPluginContext } from '../transformer.types.js';

export const read = (): TransformerPlugin => {
  const name = 'read';

  const run = (context: TransformerPluginContext) => {
    if (!context.filePath) return;

    context.fileContent = fs.readFileSync(context.filePath, 'utf8');

    context.fileExtension = path.extname(context.filePath);

    context.fileName = path.basename(context.filePath, context.fileExtension);

    context.directoryPath = path.dirname(context.filePath);

    context.directoryName = path.basename(context.directoryPath);
  };

  return { name, run };
};
