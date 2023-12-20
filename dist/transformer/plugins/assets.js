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
        var _a, _b, _c, _d;
        context.assetsDestination = (_b = (_a = options).destination) === null || _b === void 0 ? void 0 : _b.call(_a, context);
        context.assetsSource = (_d = (_c = options).source) === null || _d === void 0 ? void 0 : _d.call(_c, context);
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
