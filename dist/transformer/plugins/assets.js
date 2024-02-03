import fs from 'fs-extra';
import path from 'path';
export const ASSETS_OPTIONS = {
    once: true,
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
    const sources = new Set();
    const run = (context) => {
        context.assetsDestination = options.destination(context);
        context.assetsSource = options.source(context);
        if (!context.assetsSource)
            return;
        if (!fs.existsSync(context.assetsSource))
            return;
        if (options.once && sources.has(context.assetsSource))
            return;
        sources.add(context.assetsSource);
        fs.copySync(context.assetsSource, context.assetsDestination);
    };
    return { name, run };
};
