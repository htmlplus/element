import { host } from './host.js';
export const shadowRoot = (target) => {
    var _a;
    return (_a = host(target)) === null || _a === void 0 ? void 0 : _a.shadowRoot;
};
