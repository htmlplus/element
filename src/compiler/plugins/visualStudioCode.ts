import { Global } from '../../types';

export const VISUAL_STUDIO_CODE_OPTIONS: Partial<VisualStudioCodeOptions> = {};

export interface VisualStudioCodeOptions {
  destination: string;
}

export const visualStudioCode = (options: VisualStudioCodeOptions) => {
  const name = 'visualStudioCode';

  options = Object.assign({}, VISUAL_STUDIO_CODE_OPTIONS, options);

  const finish = (global: Global) => {
    // TODO
    // {
    //   version: 1.1,
    //   tags: [
    //     {
    //       name: context.componentKey,
    //       description: {
    //         kind: 'markdown',
    //         value: description
    //       },
    //       attributes: properties,
    //       references: [
    //         {
    //           name: 'Source code',
    //           url: `https://github.com/htmlplus/core/tree/main/src/components/${context.directoryName}/${context.fileName}.tsx`
    //         }
    //       ]
    //     }
    //   ]
    // };
  };

  return { name, finish };
};
