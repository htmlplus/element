import { Context } from '../../types';
import { print as core } from '../utils/index.js';

export const print = () => {
  const name = 'print';

  const next = (context: Context) => {
    context.script = core(context.fileAST!);
  };

  return {
    name,
    next
  };
};
