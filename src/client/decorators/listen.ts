import { ListenOptions } from '../../types/index.js';

export function Listen(name: string, options: ListenOptions = {}) {
    return function (target: any, propertyKey: PropertyKey) { }
}