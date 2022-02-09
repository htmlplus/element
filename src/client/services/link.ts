import { defineProperty, host } from '../utils/index.js';

const links = new Map<string, any>();

type LinkInstance = any;
type LinkTarget = any;
type LinkPropertyName = string;
type LinkPropertyType = 'action' | 'inject' | 'observable';
type LinkProperty = {
  element?: HTMLElement;
  instance?: LinkInstance;
  name?: LinkPropertyName;
  type?: LinkPropertyType;
  value?: any;
};

export type LinkConfig = {
  scope?: Function;
};

// TODO: return type
export const createLink = (namespace: string) => {
  if (links.has(namespace)) return links.get(namespace);

  const config: LinkConfig = {
    scope: (i) => i.connector
  };

  let disconnecting = false;

  const children = new Map<LinkInstance, Set<LinkProperty>>();

  const parents = new Map<LinkInstance, LinkProperty>();

  const properties: Array<LinkProperty> = [];

  const find = (source: LinkProperty) => {
    return properties.find(
      (destination) => destination.instance === source.instance && destination.name === source.name
    );
  };

  const register = (source: LinkProperty) => {
    properties.push(source);

    if (!children.has(source.instance)) children.set(source.instance, new Set<LinkProperty>());

    // TODO: any
    const siblings = children.get(source.instance) as any;

    siblings.add(source);
  };

  const unregister = (source: LinkProperty) => {
    // TODO: any
    source = find(source) as any;

    const index = properties.findIndex((property) => property === source);

    if (index === -1) return;

    properties.splice(index, 1);

    // TODO: any
    const siblings = children.get(source.instance) as any;

    siblings.delete(source);

    if (siblings.size) return;

    children.delete(source.instance);

    parents.delete(source.instance);
  };

  const get = (source: LinkProperty) => {
    // TODO: any
    return source.instance[source.name as any];
  };

  const set = (source: LinkProperty, value: any) => {
    // TODO: any
    source.instance[source.name as any] = value;
  };

  const reset = (source: LinkProperty) => {
    if (source.type === 'action') return;

    if (source.type === 'inject') return set(source, source.value /* TODO */);

    // TODO: any
    defineProperty(source.instance, source.name as any, {
      value: get(source) /* TODO */,
      enumerable: true,
      configurable: true
    });
  };

  const map = (source: LinkProperty, destination: LinkProperty) => {
    let value = get(source);

    if (typeof value === 'function') value = value.bind(source.instance);

    set(destination, value);
  };

  const proxy = (source: LinkProperty) => {
    let value = get(source);

    // TODO: any
    defineProperty(source.instance, source.name as any, {
      enumerable: true,
      configurable: true,
      get() {
        return value;
      },
      set(input) {
        if (input === value) return;

        value = input;

        siblings(source, ['inject']).map((destination) => set(destination, value));
      }
    });
  };

  const parent = (source: LinkProperty) => {
    const cache = parents.get(source.instance);

    if (cache) return cache;

    // TODO: element? and any
    let parent = source.element?.parentElement as any;

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

  const scope = (source: LinkProperty) => {
    if (!source) return;

    // TODO
    if (disconnecting) return source.instance['$scope-prev'];

    // TODO: &&
    let input = config.scope && config.scope(source.instance);

    if (typeof input !== 'undefined') return input;

    // TODO: any
    return (
      scope(parent(source) as any) ?? source.instance['$scope-auto'] ?? (source.instance['$scope-auto'] = Math.random())
    );
  };

  const siblings = (source: LinkProperty, types: Array<LinkPropertyType>) => {
    return properties.filter((destination) => {
      // TODO: any
      if (!types.includes(destination.type as any)) return false;

      if (source === destination) return false;

      if (source.name !== destination.name) return false;

      if (scope(source) !== scope(destination)) return false;

      return true;
    });
  };

  const connect = (source: LinkProperty) => {
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

  const disconnect = (source: LinkProperty) => {
    reset(source);

    if (source.type === 'inject') return unregister(source);

    siblings(source, ['inject']).forEach(reset);

    unregister(source);
  };

  const reconnect = (instance: LinkInstance) => {
    const p = properties.filter((property) => property.instance === instance);
    disconnecting = true;
    p.forEach(disconnect);
    disconnecting = false;
    p.forEach(connect);
  };

  const decorator = (type: LinkPropertyType) => () => (target: LinkTarget, name: LinkPropertyName) => {
    const connected = target.connectedCallback;

    target.connectedCallback = function () {
      connected && connected.bind(this)();

      const property: LinkProperty = {
        element: host(this),
        instance: this,
        name,
        type,
        value: this[name]
      };

      if (find(property)) console.error('TODO: Error log');

      connect(property);
    };

    const disconnected = target.disconnectedCallback;

    target.disconnectedCallback = function () {
      disconnected && disconnected.bind(this)();

      const property = find({ instance: this, name });

      if (!property) console.error('TODO: Error log');

      // TODO: any
      disconnect(property as any);
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
