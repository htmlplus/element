import * as CONSTANTS from '../../constants/index.js';
import { appendToMethod, dispatch, off, on } from '../utils/index.js';
export function Provider(namespace) {
    return function (target, key, descriptor) {
        const symbol = Symbol();
        const [MAIN, SUB] = namespace.split('.');
        const prefix = `htmlplus:${MAIN}`;
        const cleanups = (instance) => {
            return (instance[symbol] ||= new Map());
        };
        const update = (instance) => {
            const options = {};
            options.detail = descriptor.get.call(instance);
            dispatch(instance, `${prefix}:update`, options);
            if (!SUB)
                return;
            options.bubbles = true;
            dispatch(instance, `${prefix}:${instance[SUB]}:update`, options);
        };
        // TODO
        appendToMethod(target, CONSTANTS.LIFECYCLE_CONNECTED, function () {
            const cleanup = () => {
                off(this, `${prefix}:presence`, onPresence);
                cleanups(this).delete(prefix);
            };
            const onPresence = (event) => {
                event.stopPropagation();
                event.detail(this, descriptor.get.call(this));
            };
            on(this, `${prefix}:presence`, onPresence);
            cleanups(this).set(prefix, cleanup);
        });
        appendToMethod(target, CONSTANTS.LIFECYCLE_UPDATE, function (states) {
            update(this);
            if (cleanups(this).size && !states.has(SUB))
                return;
            cleanups(this).get(`${prefix}:${states.get(SUB)}`)?.();
            const type = `${prefix}:${this[SUB]}`;
            const cleanup = () => {
                off(window, `${type}:presence`, onPresence);
                cleanups(this).delete(type);
                dispatch(window, `${type}:disconnect`);
            };
            const onPresence = () => {
                update(this);
            };
            on(window, `${type}:presence`, onPresence);
            cleanups(this).set(type, cleanup);
        });
        appendToMethod(target, CONSTANTS.LIFECYCLE_DISCONNECTED, function () {
            cleanups(this).forEach((cleanup) => cleanup());
        });
    };
}
export function Consumer(namespace) {
    return function (target, key) {
        const symbol = Symbol();
        const [MAIN, SUB] = namespace.split('.');
        const prefix = `htmlplus:${MAIN}`;
        const cleanups = (instance) => {
            return (instance[symbol] ||= new Map());
        };
        const update = (instance, state) => {
            instance[key] = state;
        };
        // TODO
        appendToMethod(target, CONSTANTS.LIFECYCLE_CONNECTED, function () {
            // TODO
            if (SUB && this[SUB])
                return;
            // TODO
            let connected;
            const options = {
                bubbles: true
            };
            options.detail = (parent, state) => {
                // TODO
                connected = true;
                update(this, state);
                const cleanup = () => {
                    off(parent, `${prefix}:update`, onUpdate);
                    cleanups(this).delete(prefix);
                    update(this, undefined);
                };
                const onUpdate = (event) => {
                    update(this, event.detail);
                };
                on(parent, `${prefix}:update`, onUpdate);
                cleanups(this).set(prefix, cleanup);
            };
            dispatch(this, `${prefix}:presence`, options);
            // TODO: When the `Provider` element is activated after the `Consumer` element.
            !connected && setTimeout(() => dispatch(this, `${prefix}:presence`, options));
        });
        appendToMethod(target, CONSTANTS.LIFECYCLE_UPDATE, function (states) {
            if (cleanups(this).size && !states.has(SUB))
                return;
            cleanups(this).get(`${prefix}:${states.get(SUB)}`)?.();
            const type = `${prefix}:${this[SUB]}`;
            const cleanup = () => {
                off(window, `${type}:disconnect`, onDisconnect);
                off(window, `${type}:update`, onUpdate);
                cleanups(this).delete(type);
                update(this, undefined);
            };
            const onDisconnect = () => {
                update(this, undefined);
            };
            const onUpdate = (event) => {
                update(this, event.detail);
            };
            on(window, `${type}:disconnect`, onDisconnect);
            on(window, `${type}:update`, onUpdate);
            cleanups(this).set(type, cleanup);
            dispatch(window, `${type}:presence`);
        });
        appendToMethod(target, CONSTANTS.LIFECYCLE_DISCONNECTED, function () {
            cleanups(this).forEach((cleanup) => cleanup());
        });
    };
}
