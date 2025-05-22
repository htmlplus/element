import * as CONSTANTS from '../../constants/index.js';
import { HTMLPlusElement } from '../../types/index.js';
import { dispatch, off, on, wrapMethod } from '../utils/index.js';

export function Provider(namespace: string) {
  return function (target: HTMLPlusElement, key: PropertyKey) {
    const symbol = Symbol();

    const [MAIN, SUB] = namespace.split('.');

    const prefix = `${CONSTANTS.KEY}:${MAIN}`;

    const cleanups = (instance: HTMLPlusElement): Map<string, any> => {
      return (instance[symbol] ||= new Map());
    };

    const update = (instance: HTMLPlusElement) => {
      const options: CustomEventInit = {};

      options.detail = instance[key];

      dispatch(instance, `${prefix}:update`, options);

      if (!SUB) return;

      options.bubbles = true;

      dispatch(instance, `${prefix}:${instance[SUB]}:update`, options);
    };

    // TODO
    wrapMethod('after', target, CONSTANTS.LIFECYCLE_CONNECTED, function () {
      const cleanup = () => {
        off(this, `${prefix}:presence`, onPresence);

        cleanups(this).delete(prefix);
      };

      const onPresence = (event: any) => {
        event.stopPropagation();

        event.detail(this, this[key]);
      };

      on(this, `${prefix}:presence`, onPresence);

      cleanups(this).set(prefix, cleanup);
    });

    wrapMethod('after', target, CONSTANTS.LIFECYCLE_UPDATE, function (states) {
      update(this);

      if (cleanups(this).size && !states.has(SUB)) return;

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

    wrapMethod('after', target, CONSTANTS.LIFECYCLE_DISCONNECTED, function () {
      cleanups(this).forEach((cleanup) => cleanup());
    });
  };
}

export function Consumer(namespace: string) {
  return function (target: HTMLPlusElement, key: PropertyKey) {
    const symbol = Symbol();

    const [MAIN, SUB] = namespace.split('.');

    const prefix = `${CONSTANTS.KEY}:${MAIN}`;

    const cleanups = (instance: HTMLPlusElement): Map<string, any> => {
      return (instance[symbol] ||= new Map());
    };

    const update = (instance: HTMLPlusElement, state) => {
      instance[key] = state;
    };

    // TODO
    wrapMethod('after', target, CONSTANTS.LIFECYCLE_CONNECTED, function () {
      // TODO
      if (SUB && this[SUB]) return;

      // TODO
      let connected;

      const options: CustomEventInit = {
        bubbles: true
      };

      options.detail = (parent: HTMLPlusElement, state: any) => {
        // TODO
        connected = true;

        update(this, state);

        const cleanup = () => {
          off(parent, `${prefix}:update`, onUpdate);

          cleanups(this).delete(prefix);

          update(this, undefined);
        };

        const onUpdate = (event: any) => {
          update(this, event.detail);
        };

        on(parent, `${prefix}:update`, onUpdate);

        cleanups(this).set(prefix, cleanup);
      };

      dispatch(this, `${prefix}:presence`, options);

      // TODO: When the `Provider` element is activated after the `Consumer` element.
      !connected && setTimeout(() => dispatch(this, `${prefix}:presence`, options));
    });

    wrapMethod('after', target, CONSTANTS.LIFECYCLE_UPDATE, function (states) {
      if (cleanups(this).size && !states.has(SUB)) return;

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

      const onUpdate = (event: any) => {
        update(this, event.detail);
      };

      on(window, `${type}:disconnect`, onDisconnect);
      on(window, `${type}:update`, onUpdate);

      cleanups(this).set(type, cleanup);

      dispatch(window, `${type}:presence`);
    });

    wrapMethod('after', target, CONSTANTS.LIFECYCLE_DISCONNECTED, function () {
      cleanups(this).forEach((cleanup) => cleanup());
    });
  };
}
