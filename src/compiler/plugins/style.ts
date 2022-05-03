import t from '@babel/types';
import fs from 'fs';
import path from 'path';

import * as CONSTANTS from '../../constants/index.js';
import { Context } from '../../types/index.js';

const defaults: StyleOptions = {
  extensions: ['scss', 'css'],
  directory(context: Context) {
    return context.directoryPath!;
  },
  filename(context: Context) {
    return context.fileName!;
  }
};

export type StyleOptions = {
  extensions?: Array<string>;
  directory?: (context: Context) => string;
  filename?: (context: Context) => string;
};

export const style = (options: StyleOptions) => {
  const name = 'style';

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

    if (!context.stylePath) return;

    context.fileAST!.program.body.unshift(
      t.importDeclaration(
        [t.importDefaultSpecifier(t.identifier('AUTO_IMPORT_STYLE'))],
        t.stringLiteral(context.stylePath + '?inline')
      )
    );

    context.class!.body.body.unshift(
      t.classProperty(
        t.identifier(CONSTANTS.STATIC_STYLES),
        t.identifier('AUTO_IMPORT_STYLE'),
        undefined,
        null,
        undefined,
        true
      )
    );
  };

  return {
    name,
    next
  };
};
