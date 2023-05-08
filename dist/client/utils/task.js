export const task = (options) => {
    let isPending, promise;
    const run = () => {
        if (options.canStart && !options.canStart())
            return Promise.resolve(false);
        if (!isPending)
            promise = enqueue();
        return promise;
    };
    const enqueue = async () => {
        isPending = true;
        try {
            await promise;
        }
        catch (error) {
            Promise.reject(error);
        }
        // TODO: maybe is optional
        if (!isPending)
            return promise;
        try {
            if (options.canRun && !options.canRun())
                return (isPending = false);
            options.run();
            isPending = false;
            return true;
        }
        catch (error) {
            isPending = false;
            throw error;
        }
    };
    return run;
};
