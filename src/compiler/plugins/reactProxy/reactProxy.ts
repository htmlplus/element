import { __dirname, isDirectoryEmpty, renderTemplate } from '../../utils/index.js';

export interface ReactProxyOptions {
  dist: string;
  corePackageName: string;
  categorize?: boolean;
}

/**
 * <PlusDialog>
 *   <PlusDialogBody>
 *   </PlusDialogBody>
 * </PlusDialog>
 *
 * <Dialog>
 *   <DialogBody>
 *   </DialogBody>
 * </Dialog>
 *
 * <Dialog>
 *   <Dialog.Body>
 *   </Dialog.Body>
 * </Dialog>
 *
 * <PlusDialog>
 *   <PlusDialog.Body>
 *   </PlusDialog.Body>
 * </PlusDialog>
 */

export const reactProxy = (options: ReactProxyOptions) => {
  const name = 'reactProxy';

  const finish = async (global) => {
    const contexts = global.contexts;

    const config = { cwd: __dirname(import.meta.url) };

    const component = 'templates/src/components/{{fileName}}*';

    global = Object.assign({}, global, options);

    if (await isDirectoryEmpty(options.dist)) {
      renderTemplate(['templates/**', `!${component}`], options.dist, config)(global);
    } else {
      renderTemplate(['templates/src/proxy*', 'templates/src/components/index*'], options.dist, config)(global);
    }

    for (const key of Object.keys(contexts)) {
      const context = Object.assign({}, contexts[key], options);
      renderTemplate(component, options.dist, config)(context);
    }
  };

  return {
    name,
    finish
  };
};
