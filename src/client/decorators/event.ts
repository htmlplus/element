import { EventOptions, PlusElement } from '../../types/index.js';
import { host } from '../helpers/index.js';
import { DecoratorSetup, decorator } from '../utils/index.js';

export type EventEmitter<T = any> = (data?: T) => CustomEvent<T>;

// TODO: add global hook
export function Event<T = any>(options: EventOptions = {}) {
  const setup: DecoratorSetup = (target: PlusElement, propertyKey: PropertyKey) => {
    return {
      get() {
        return (detail?: T): CustomEvent<T> => {
          const name = options.name || String(propertyKey);
          const event = new CustomEvent(name, { ...options, detail });
          host(this).dispatchEvent(event);
          return event;
        };
      }
    };
  };
  return decorator(setup);
}
