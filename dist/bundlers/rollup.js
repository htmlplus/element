import { transformer } from '../transformer/index.js';
export const htmlplus = (...plugins) => {
    const { start, run, finish } = transformer(...plugins);
    return {
        name: 'htmlplus',
        async buildStart() {
            await start();
        },
        async load(id) {
            if (!id.endsWith('.tsx'))
                return;
            const { isInvalid, script } = await run(id);
            if (isInvalid)
                return;
            return script;
        },
        async buildEnd(error) {
            if (error)
                throw error;
            await finish();
        }
    };
};
