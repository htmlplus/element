import fs from 'fs-extra';
import path from 'path';
export const ASSETS_OPTIONS = {
    destination(context) {
        return path.join('dist', 'assets', context.fileName);
    },
    source(context) {
        return path.join(context.directoryPath, 'assets');
    }
};
export const assets = (options) => {
    const name = 'assets';
    options = Object.assign({}, ASSETS_OPTIONS, options);
    const finish = (global) => {
        for (const context of global.contexts) {
            context.assetsDestination = options.destination(context);
            context.assetsSource = options.source(context);
            if (!context.assetsSource)
                continue;
            if (!fs.existsSync(context.assetsSource))
                continue;
            fs.copySync(context.assetsSource, context.assetsDestination);
        }
    };
    return { name, finish };
};
