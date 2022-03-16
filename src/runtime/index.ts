import { html as core } from 'uhtml';

export const html = (template, ...values: any[]): any => {
  return core(template, ...values)
};
