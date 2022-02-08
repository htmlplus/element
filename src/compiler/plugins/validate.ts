import { Context } from '../../types';

export const validate = () => {
  const name = 'validate';

  const next = (context: Context) => {};

  return {
    name,
    next
  };
};
