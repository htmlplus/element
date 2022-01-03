import { ListenOptions as ListenOptionsBase } from '../../types/index.js';

// TODO
export function ListenOptions(options: Omit<ListenOptionsBase, 'target'> = {}) {
    return function (target: any, propertyKey: PropertyKey) { }
}