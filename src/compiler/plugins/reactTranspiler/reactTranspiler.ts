import { renderTemplate } from '../../utils/index.js';

export interface ReactTranspilerOptions {
  dist: string;
}

export const reactTranspiler = (options: ReactTranspilerOptions) => {
  const name = 'reactTranspiler';

  const finish = (global) => {
    const config = { cwd: import.meta.url };
  };

  return {
    name,
    finish
  };
};
