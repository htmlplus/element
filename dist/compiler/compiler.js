import ora from 'ora';
import path from 'path';
const logger = ora({
    color: 'yellow'
});
const log = (message, persist) => {
    var _a, _b;
    (_b = (_a = logger.start(`${new Date().toLocaleTimeString()} [HTMLPLUS] ${message}`))[persist ? 'succeed' : '']) === null || _b === void 0 ? void 0 : _b.call(_a);
};
export const compiler = (...plugins) => {
    let global = {
        contexts: []
    };
    log(`Starting...`, true);
    log(`${plugins.length} plugins found.`, true);
    const start = async () => {
        log(`Plugins are starting...`, true);
        for (const plugin of plugins) {
            if (!plugin.start)
                continue;
            log(`Plugin '${plugin.name}' is starting...`);
            global = (await plugin.start(global)) || global;
            log(`Plugin '${plugin.name}' started successfully.`);
        }
        log(`Plugins started successfully.`, true);
    };
    const run = async (filePath) => {
        const key = filePath.split(/[\/|\\]/g).pop();
        let context = {
            filePath
        };
        const parsed = path.parse(filePath);
        for (const plugin of plugins) {
            if (!plugin.run)
                continue;
            log(`Plugin '${plugin.name}' is executing on '${path.basename(parsed.dir)}/${parsed.base}' file.`);
            try {
                context = (await plugin.run(context, global)) || context;
            }
            catch (error) {
                log(`Error in '${plugin.name}' plugin on '${path.basename(parsed.dir)}/${parsed.base}' file.`, true);
                throw error;
            }
            global.contexts = global.contexts
                .filter((current) => {
                return current.filePath != context.filePath;
            })
                .concat(context);
            log(`Plugin '${plugin.name}' executed successfully on '${path.basename(filePath)}' file.`);
            if (context.isInvalid)
                break;
        }
        logger.stop();
        if (context.isInvalid)
            log(`File '${key}' break executing because file is invalid.`, true);
        return context;
    };
    const finish = async () => {
        log(`Plugins are finishing...`, true);
        for (const plugin of plugins) {
            if (!plugin.finish)
                continue;
            log(`Plugin '${plugin.name}' is finishing...`);
            global = (await plugin.finish(global)) || global;
            log(`Plugin '${plugin.name}' finished successfully.`);
        }
        log(`Plugins finished successfully.`, true);
        log(`Finished.`, true);
    };
    return { start, run, finish };
};
