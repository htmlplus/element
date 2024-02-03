import { kebabCase } from 'change-case';
import { typeOf } from './typeOf.js';
/**
 * TODO
 */
export const classes = (input, smart) => {
    const result = [];
    switch (typeOf(input)) {
        case 'array': {
            for (const item of input) {
                result.push(classes(item, smart));
            }
            break;
        }
        case 'object': {
            const keys = Object.keys(input);
            for (const key of keys) {
                const value = input[key];
                const name = kebabCase(key);
                const type = typeOf(value);
                if (!smart) {
                    value && result.push(name);
                    continue;
                }
                switch (type) {
                    case 'boolean': {
                        value && result.push(`${name}`);
                        break;
                    }
                    case 'number':
                    case 'string': {
                        result.push(`${name}-${value}`);
                        break;
                    }
                }
            }
            break;
        }
        case 'string': {
            result.push(input);
            break;
        }
    }
    return result.filter((item) => item).join(' ');
};
