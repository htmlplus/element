let isInitialized = false;

const handlers = new Map();

function debug(namespace: string, instance: unknown, ...args: unknown[]): void {
  if (instance) {
    if (typeof args.at(-1) != 'object') {
      args.push({});
    }
    args.at(-1)!['INSTANCE'] = instance;
  }

  console.log(`[${namespace}]`, ...args);
}

function getTargetName(target: any): string {
  return target === window ? 'window' : target.localName;
}

export function Logger<T extends { new (...args: any[]): {} }>(constructor: T) {
  return class extends constructor {
    constructor(...args: any[]) {
      super(...args);

      const keys = Object.getOwnPropertyNames(constructor.prototype);

      const self = this;

      for (const key of keys) {
        const value = (this as any)[key];

        if (typeof value !== 'function' || key === 'constructor') continue;

        (this as any)[key] = function (...args: any[]) {
          const meta = {};

          if (args.length) {
            meta['args'] = args;
          }

          debug(constructor.name, self, `Before calling method: ${key}`, meta);

          const result = value.apply(this, args);

          meta['return'] = result;

          debug(constructor.name, self, `After method ${key}`, meta);

          return result;
        };
      }

      if (isInitialized) return;

      isInitialized = true;

      const addEventListener = EventTarget.prototype.addEventListener;

      EventTarget.prototype.addEventListener = function (type, listener, options) {
        debug(
          'global',
          undefined,
          `Listening to "${type}" on the "${getTargetName(this)}" element`
        );

        const has = handlers.has(listener);

        if (!has) {
          const wrapper = (evt: Event) => {
            debug('global', undefined, `Recieving an event on "${type}"`);

            (listener as EventListener)(evt);

            debug('global', undefined, `Recieved an event on "${type}"`);
          };
          handlers.set(listener, wrapper);
        }

        const wrapper = handlers.get(listener);

        addEventListener.call(this, type, wrapper, options);
      };

      const removeEventListener = EventTarget.prototype.removeEventListener;

      EventTarget.prototype.removeEventListener = function (type, listener, options) {
        const meta = {};

        if (options) {
          meta['options'] = options;
        }

        debug(
          'global',
          undefined,
          `Stopped listening to "${type}" on the "${getTargetName(this)}" element`,
          meta
        );

        const wrapper = handlers.get(listener);

        handlers.delete(listener);

        removeEventListener.call(this, type, wrapper, options);
      };

      const dispatchEvent = EventTarget.prototype.dispatchEvent;

      EventTarget.prototype.dispatchEvent = function (event) {
        debug(
          'global',
          undefined,
          `Dispatching event "${event.type}" on "${getTargetName(this)}" element`,
          {
            event,
            target: this
          }
        );

        const result = dispatchEvent.call(this, event);

        debug(
          'global',
          undefined,
          `Dispatched event "${event.type}" on "${getTargetName(this)}" element`,
          {
            event,
            target: this,
            return: result
          }
        );

        return result;
      };
    }
  };
}
