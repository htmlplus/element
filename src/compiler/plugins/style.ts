import t from '@babel/types';
import fs from 'fs';
import path from 'path';
import core, { Options } from 'sass';

import * as CONSTANTS from '../../constants/index.js';
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
  sass?: Options<'sync'>;
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

    const { css, loadedUrls } = core.compile(context.stylePath, {
      ...(options.sass || {}),
      style: 'compressed'
    });

    context.styleParsed = css.toString();

    // TODO loadedUrls;
    context.styleDependencies = [];

    if (context.styleParsed) return;

    context.class!.body.body.unshift(
      t.classProperty(
        t.identifier(CONSTANTS.STATIC_STYLES),
        t.stringLiteral(context.styleParsed),
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
