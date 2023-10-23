import { pascalCase } from 'change-case';
import { __dirname, isDirectoryEmpty, renderTemplate } from '../../utils/index.js';
export const CUSTOM_ELEMENT_REACT_OPTIONS = {};
export const customElementReact = (options) => {
    const name = 'customElementReact';
    options = Object.assign({}, CUSTOM_ELEMENT_REACT_OPTIONS, options);
    const finish = (global) => {
        // TODO
        const globalNew = {
            contexts: global.contexts.reduce((previous, current) => (Object.assign(Object.assign({}, previous), { [current.filePath]: current })), {}),
            options
        };
        const config = { cwd: __dirname(import.meta.url) };
        const isEmpty = isDirectoryEmpty(options.destination);
        const skip = [];
        const getKey = (component) => component.className;
        for (const key in globalNew.contexts) {
            const context = globalNew.contexts[key];
            const classEvents = context.classEvents.map((classEvent) => {
                var _a, _b;
                const from = 'on' + pascalCase(classEvent.key.name);
                const to = (_b = (_a = options.eventName) === null || _a === void 0 ? void 0 : _a.call(options, from)) !== null && _b !== void 0 ? _b : from;
                return Object.assign(Object.assign({}, classEvent), { from,
                    to });
            });
            const fileName = context.fileName;
            const importerComponent = options.importerComponent(context);
            const importerComponentType = options.importerComponentType(context);
            const state = Object.assign(Object.assign({}, context), { classEvents,
                fileName,
                importerComponent,
                importerComponentType,
                options });
            const patterns = [
                'templates/src/components/*fileName*.ts.hbs',
                '!templates/src/components/*fileName*.compact.ts.hbs'
            ];
            renderTemplate(patterns, options.destination, config)(state);
        }
        if (options.compact) {
            globalNew.groups = Object.values(globalNew.contexts)
                .sort((a, b) => getKey(b).length - getKey(a).length)
                .map((component, index, components) => ({
                key: getKey(component),
                components: components.filter((current) => getKey(current).startsWith(getKey(component)))
            }))
                .sort((a, b) => b.components.length - a.components.length)
                .filter((group) => {
                if (skip.includes(group.key))
                    return;
                group.components.forEach((component) => skip.push(getKey(component)));
                return true;
            })
                .map((group) => {
                const all = group.components
                    .reverse()
                    .map((component, index) => {
                    const componentClassNameInCategory = getKey(component).replace(group.key, '');
                    const importerComponent = options.importerComponent(component);
                    const importerComponentType = options.importerComponentType(component);
                    return Object.assign(Object.assign({}, component), { componentClassNameInCategory,
                        importerComponent,
                        importerComponentType });
                })
                    // TODO: experimental
                    .sort((a, b) => (getKey(b) < getKey(a) ? 0 : -1));
                return {
                    all,
                    filterd: all.slice(1),
                    root: all[0],
                    single: all.length == 1
                };
            })
                .sort((a, b) => (getKey(a.root) < getKey(b.root) ? -1 : 0));
            for (const group of globalNew.groups) {
                if (group.single)
                    continue;
                const state = Object.assign({ fileName: group.root.fileName, options }, group);
                const patterns = ['templates/src/components/*fileName*.compact.ts.hbs'];
                renderTemplate(patterns, options.destination, config)(state);
            }
        }
        if (isEmpty) {
            const patterns = [
                'templates/**',
                '!templates/src/components/*fileName*.ts.hbs',
                '!templates/src/components/*fileName*.compact.ts.hbs'
            ];
            renderTemplate(patterns, options.destination, config)(globalNew);
        }
        if (!isEmpty) {
            const patterns = ['templates/src/proxy*', 'templates/src/components/index*'];
            renderTemplate(patterns, options.destination, config)(globalNew);
        }
    };
    return { name, finish };
};