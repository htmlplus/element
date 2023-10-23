import { paramCase } from 'change-case';
import { typeOf } from './typeOf.js';
export const classes = (input, smart) => {
    const result = [];
    switch (typeOf(input)) {
        case 'array': {
            input.forEach((item) => {
                const value = classes(item, smart);
                if (!value)
                    return;
                result.push(value);
            });
            break;
        }
        case 'object': {
            const keys = Object.keys(input);
            for (const key of keys) {
                const value = input[key];
                const name = paramCase(key);
                const type = typeOf(value);
                if (!smart) {
                    if (!value)
                        continue;
                    result.push(name);
                    continue;
                }
                switch (type) {
                    case 'boolean': {
                        if (!value)
                            continue;
                        result.push(`${name}`);
                        break;
                    }
                    case 'number': {
                        result.push(`${name}-${value}`);
                        break;
                    }
                    case 'string': {
                        switch (value) {
                            case '':
                            case 'true':
                                result.push(`${name}`);
                                break;
                            case 'false':
                                break;
                            default:
                                result.push(`${name}-${value}`);
                                break;
                        }
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
    return result.join(' ');
};