import path from 'path';
import { fileURLToPath } from 'url';

import { isDirectoryEmpty, renderTemplate } from '../../utils/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ReactProxyOptions {
  dist: string;
  corePackageName: string;
  // TODO
  // categorize?: boolean;
  // prefix?: boolean;
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

  const finish = (global) => {
    const contexts = global.contexts;

    const config = { cwd: __dirname };

    const component = 'templates/src/components/{{fileName}}*';

    global = Object.assign({}, global, options);

    if (isDirectoryEmpty(options.dist)) {
      renderTemplate(['templates/**', `!${component}`], options.dist, config)(global);
    } else {
      renderTemplate(['templates/src/proxy*'], options.dist, config)(global);
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
