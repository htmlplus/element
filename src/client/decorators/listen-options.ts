import { ListenOptions } from '../../types/index.js';

export function ListenOptions(options: Omit<ListenOptions, 'target'> = {}) {
    return function (target: any, propertyKey: PropertyKey) { }
}