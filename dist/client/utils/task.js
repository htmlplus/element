export const task = (options) => {
    let running, promise;
    const run = () => {
        if (options.canStart && !options.canStart())
            return Promise.resolve(false);
        if (!running)
            promise = enqueue();
        return promise;
    };
    const enqueue = async () => {
        running = true;
        try {
            await promise;
        }
        catch (error) {
            Promise.reject(error);
        }
        // TODO: maybe is optional
        if (!running)
            return promise;
        try {
            if (options.canRun && !options.canRun())
                return (running = false);
            options.handler();
            running = false;
            return true;
        }
        catch (error) {
            running = false;
            throw error;
        }
    };
    return run;
};
