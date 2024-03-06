import * as CONSTANTS from '../../constants/index.js';
import { appendToMethod, dispatch, host } from '../utils/index.js';
/**
 * TODO
 * @param namespace
 */
export function Consumer(namespace) {
    return function (target, key) {
        appendToMethod(target, CONSTANTS.LIFECYCLE_CONSTRUCTED, function () {
            const options = {
                bubbles: true
            };
            options.detail = (state) => {
                this[key] = state;
                const successful = !!host(this).parentElement;
                return successful;
            };
            dispatch(this, `internal:context:${namespace}`, options);
        });
    };
}
