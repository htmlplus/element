import { paramCase } from 'change-case';
import { typeOf } from '../utils/type-of.js';

export const styles = (input) => {

    const type = typeOf(input);

    if (type == 'undefined')
        return input;

    if (type == 'array')
        return input.join('; ');

    if (type != 'object')
        return input;

    return Object
        .keys(input)
        .map((key) => `${paramCase(key)}: ${input[key]}`)
        .join('; ');
}