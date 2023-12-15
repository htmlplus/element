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
        const getKey = (element) => element.className;
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
            const importerElement = options.importerElement(context);
            const importerElementType = options.importerElementType(context);
            const state = Object.assign(Object.assign({}, context), { classEvents,
                fileName,
                importerElement,
                importerElementType,
                options });
            const patterns = [
                'templates/src/elements/*fileName*.ts.hbs',
                '!templates/src/elements/*fileName*.compact.ts.hbs'
            ];
            renderTemplate(patterns, options.destination, config)(state);
        }
        if (options.compact) {
            globalNew.groups = Object.values(globalNew.contexts)
                .sort((a, b) => getKey(b).length - getKey(a).length)
                .map((element, index, elements) => ({
                key: getKey(element),
                elements: elements.filter((current) => getKey(current).startsWith(getKey(element)))
            }))
                .sort((a, b) => b.elements.length - a.elements.length)
                .filter((group) => {
                if (skip.includes(group.key))
                    return;
                group.elements.forEach((element) => skip.push(getKey(element)));
                return true;
            })
                .map((group) => {
                const all = group.elements
                    .reverse()
                    .map((element, index) => {
                    const elementClassNameInCategory = getKey(element).replace(group.key, '');
                    const importerElement = options.importerElement(element);
                    const importerElementType = options.importerElementType(element);
                    return Object.assign(Object.assign({}, element), { elementClassNameInCategory,
                        importerElement,
                        importerElementType });
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
                const patterns = ['templates/src/elements/*fileName*.compact.ts.hbs'];
                renderTemplate(patterns, options.destination, config)(state);
            }
        }
        if (isEmpty) {
            const patterns = [
                'templates/**',
                '!templates/src/elements/*fileName*.ts.hbs',
                '!templates/src/elements/*fileName*.compact.ts.hbs'
            ];
            renderTemplate(patterns, options.destination, config)(globalNew);
        }
        if (!isEmpty) {
            const patterns = ['templates/src/proxy*', 'templates/src/elements/index*'];
            renderTemplate(patterns, options.destination, config)(globalNew);
        }
    };
    return { name, finish };
};
