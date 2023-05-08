import { defineProperty, host } from '../utils/index.js';
const links = new Map();
// TODO: return type
export const createLink = (namespace) => {
    if (links.has(namespace))
        return links.get(namespace);
    const config = {
        scope: (i) => i.connector
    };
    let disconnecting = false;
    const children = new Map();
    const parents = new Map();
    const properties = [];
    const find = (source) => {
        return properties.find((destination) => destination.instance === source.instance && destination.name === source.name);
    };
    const register = (source) => {
        properties.push(source);
        if (!children.has(source.instance))
            children.set(source.instance, new Set());
        // TODO: any
        const siblings = children.get(source.instance);
        siblings.add(source);
    };
    const unregister = (source) => {
        // TODO: any
        source = find(source);
        const index = properties.findIndex((property) => property === source);
        if (index === -1)
            return;
        properties.splice(index, 1);
        // TODO: any
        const siblings = children.get(source.instance);
        siblings.delete(source);
        if (siblings.size)
            return;
        children.delete(source.instance);
        parents.delete(source.instance);
    };
    const get = (source) => {
        // TODO: any
        return source.instance[source.name];
    };
    const set = (source, value) => {
        // TODO: any
        source.instance[source.name] = value;
    };
    const reset = (source) => {
        if (source.type === 'action')
            return;
        if (source.type === 'inject')
            return set(source, source.value /* TODO */);
        // TODO: any
        defineProperty(source.instance, source.name, {
            value: get(source) /* TODO */,
            enumerable: true,
            configurable: true
        });
    };
    const map = (source, destination) => {
        let value = get(source);
        if (typeof value === 'function')
            value = value.bind(source.instance);
        set(destination, value);
    };
    const proxy = (source) => {
        let value = get(source);
        // TODO: any
        defineProperty(source.instance, source.name, {
            enumerable: true,
            configurable: true,
            get() {
                return value;
            },
            set(input) {
                if (input === value)
                    return;
                value = input;
                siblings(source, ['inject']).map((destination) => set(destination, value));
            }
        });
    };
    const parent = (source) => {
        var _a;
        const cache = parents.get(source.instance);
        if (cache)
            return cache;
        // TODO: element? and any
        let parent = (_a = source.element) === null || _a === void 0 ? void 0 : _a.parentElement;
        while (parent) {
            if (parent.shadowRoot) {
                const item = properties.find((property) => property.element === parent && property.name === source.name);
                if (item) {
                    parents.set(source.instance, item);
                    return item;
                }
            }
            parent = parent.parentElement;
        }
    };
    const scope = (source) => {
        var _a, _b;
        if (!source)
            return;
        // TODO
        if (disconnecting)
            return source.instance['$scope-prev'];
        // TODO: &&
        let input = config.scope && config.scope(source.instance);
        if (typeof input !== 'undefined')
            return input;
        // TODO: any
        return ((_b = (_a = scope(parent(source))) !== null && _a !== void 0 ? _a : source.instance['$scope-auto']) !== null && _b !== void 0 ? _b : (source.instance['$scope-auto'] = Math.random()));
    };
    const siblings = (source, types) => {
        return properties.filter((destination) => {
            // TODO: any
            if (!types.includes(destination.type))
                return false;
            if (source === destination)
                return false;
            if (source.name !== destination.name)
                return false;
            if (scope(source) !== scope(destination))
                return false;
            return true;
        });
    };
    const connect = (source) => {
        // TODO
        source.instance['$scope-prev'] = scope(source);
        register(source);
        switch (source.type) {
            case 'action':
                siblings(source, ['inject']).forEach((destination) => map(source, destination));
                break;
            case 'observable':
                proxy(source);
                siblings(source, ['inject']).forEach((destination) => map(source, destination));
                break;
            case 'inject':
                siblings(source, ['action', 'observable']).forEach((destination) => map(destination, source));
                break;
        }
    };
    const disconnect = (source) => {
        reset(source);
        if (source.type === 'inject')
            return unregister(source);
        siblings(source, ['inject']).forEach(reset);
        unregister(source);
    };
    const reconnect = (instance) => {
        const p = properties.filter((property) => property.instance === instance);
        disconnecting = true;
        p.forEach(disconnect);
        disconnecting = false;
        p.forEach(connect);
    };
    const decorator = (type) => () => (target, name) => {
        const connected = target.connectedCallback;
        target.connectedCallback = function () {
            connected && connected.bind(this)();
            const property = {
                element: host(this),
                instance: this,
                name,
                type,
                value: this[name]
            };
            if (find(property))
                console.error('TODO: Error log');
            connect(property);
        };
        const disconnected = target.disconnectedCallback;
        target.disconnectedCallback = function () {
            disconnected && disconnected.bind(this)();
            const property = find({ instance: this, name });
            if (!property)
                console.error('TODO: Error log');
            // TODO: any
            disconnect(property);
        };
    };
    const Action = decorator('action');
    const Inject = decorator('inject');
    const Observable = decorator('observable');
    const result = {
        Action,
        Inject,
        Observable,
        reconnect
    };
    links.set(namespace, result);
    return result;
};
