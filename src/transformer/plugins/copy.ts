import fs from 'fs-extra';
import path from 'path';

import { TransformerPlugin } from '../transformer.types.js';

export const COPY_OPTIONS: Partial<CopyOptions> = {
  at: 'start'
};

export interface CopyOptions {
  at?: 'start' | 'run' | 'finish';
  destination: string;
  source: string;
  transformer?: (content: string) => string;
}

export const copy = (options: CopyOptions): TransformerPlugin => {
  const name = 'copy';

  options = Object.assign({}, COPY_OPTIONS, options);

  const copy = (caller) => {
    if (options.at != caller) return;

    let content;

    content = fs.readFileSync(options.source, 'utf8');

    if (options.transformer) content = options.transformer(content);

    fs.ensureDirSync(path.dirname(options.destination));

    fs.writeFileSync(options.destination, content, 'utf8');
  };

  const start = () => {
    copy('start');
  };

  const run = () => {
    copy('run');
  };

  const finish = () => {
    copy('finish');
  };

  return { name, start, run, finish };
};
