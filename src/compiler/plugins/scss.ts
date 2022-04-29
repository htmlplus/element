import core, { Options } from 'sass';

import { Context } from '../../types/index.js';

export const scss = (options?: Options<'sync'>) => {
  const name = 'scss';

  const next = (context: Context) => {
    if (!context.stylePath) return;

    if (!context.stylePath.endsWith('.scss')) return;

    const { css, loadedUrls } = core.compile(context.stylePath, {
      ...(options || {}),
      style: 'compressed'
    });

    context.styleParsed = css.toString();

    // TODO loadedUrls;
    context.styleDependencies = [];
  };

  return {
    name,
    next
  };
};
