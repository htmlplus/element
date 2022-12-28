import t from '@babel/types';
import fs from 'fs-extra';
import path from 'path';

import * as CONSTANTS from '../../constants/index.js';
import { Context, Plugin } from '../../types';
import { addDependency } from '../utils/index.js';

export const STYLE_OPTIONS: Partial<StyleOptions> = {
  source(context) {
    return [
      path.join(context.directoryPath!, `${context.fileName!}.css`),
      path.join(context.directoryPath!, `${context.fileName!}.less`),
      path.join(context.directoryPath!, `${context.fileName!}.sass`),
      path.join(context.directoryPath!, `${context.fileName!}.scss`),
      path.join(context.directoryPath!, `${context.fileName!}.styl`)
    ];
  }
};

export type StyleOptions = {
  source?: (context: Context) => string | string[];
};

export const style = (options?: StyleOptions): Plugin => {
  const name = 'style';

  options = Object.assign({}, STYLE_OPTIONS, options);

  const run = (context: Context) => {
    const sources = [options?.source?.(context)].flat();

    for (const source of sources) {
      if (!source) continue;
      if (!fs.existsSync(source)) continue;
      context.stylePath = source;
      break;
    }

    if (!context.stylePath) return;

    const { local, node } = addDependency(context.fileAST!, context.stylePath, CONSTANTS.STYLE_IMPORTED);

    t.addComment(node, 'leading', CONSTANTS.COMMENT_AUTO_ADDED_DEPENDENCY, true);

    // TODO: remove 'local!'
    const property = t.classProperty(
      t.identifier(CONSTANTS.STATIC_STYLES),
      t.identifier(local!),
      undefined,
      null,
      undefined,
      true
    );

    t.addComment(property, 'leading', CONSTANTS.COMMENT_AUTO_ADDED_PROPERTY, true);

    context.class!.body.body.unshift(property);
  };

  return { name, run };
};
