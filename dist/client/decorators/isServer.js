import { isServer, toDecorator } from '../utils/index.js';
/**
 * Indicates whether the current code is running on a server.
 */
export function IsServer() {
    return toDecorator(isServer);
}
