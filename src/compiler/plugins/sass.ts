import core, { Options } from 'sass';

import { Context } from '../../types';

export const sass = (options?: Options<'sync'>) => {
  const name = 'sass';

  const next = (context: Context) => {
    if (!context.stylePath) return;

    const { css, loadedUrls } = core.compile(context.stylePath, {
      ...(options || {}),
      style: 'compressed'
    });

    context.styleParsed = css.toString();

    context.styleDependencies = []; // TODO loadedUrls;
  };

  return {
    name,
    next
  };
};
