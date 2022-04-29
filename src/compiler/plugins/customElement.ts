import { Context, Global } from '../../types/index.js';

export const customElement = () => {
  const name = 'customElement';

  const next = (context: Context, global: Global) => {};

  return {
    name,
    next
  };
};
