import { typeOf } from './typeOf.js';
export const merge = (target, ...sources) => {
    for (const source of sources) {
        if (!source)
            continue;
        if (typeOf(source) != 'object') {
            target = source;
            continue;
        }
        for (const key of Object.keys(source)) {
            if (target[key] instanceof Object &&
                source[key] instanceof Object &&
                target[key] !== source[key]) {
                target[key] = merge(target[key], source[key]);
            }
            else {
                target[key] = source[key];
            }
        }
    }
    return target;
};
