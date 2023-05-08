import fs from 'fs-extra';
import path from 'path';
export const ASSETS_OPTIONS = {
    once: true,
    destination(context) {
        return `assets/${context.fileName}`;
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
        var _a, _b;
        const source = (_a = options.source) === null || _a === void 0 ? void 0 : _a.call(options, context);
        if (!source)
            return;
        if (!fs.existsSync(source))
            return;
        if (options.once) {
            if (sources.has(source))
                return;
            sources.add(source);
        }
        const destination = (_b = options.destination) === null || _b === void 0 ? void 0 : _b.call(options, context);
        fs.copySync(source, destination);
        context.assets = source;
    };
    return { name, run };
};
