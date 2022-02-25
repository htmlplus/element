import path from 'path';
import { fileURLToPath } from 'url';

import { isDirectoryEmpty, renderTemplate } from '../../utils/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ReactProxyOptions {
  dist: string;
  // TODO
  // categorize?: boolean;
}

export const reactProxy = (options: ReactProxyOptions) => {
  const name = 'reactProxy';

  const finish = (global) => {
    const contexts = global.contexts;

    const config = { cwd: __dirname };

    const component = 'templates/src/components/{{fileName}}*';

    const pattenrs = isDirectoryEmpty(options.dist) ? ['templates/**', `!${component}`] : ['templates/src/proxy*'];

    renderTemplate(pattenrs, options.dist, config)(global);

    for (const key of Object.keys(contexts)) {
      renderTemplate(component, options.dist, config)(contexts[key]);
    }
  };

  return {
    name,
    finish
  };
};
