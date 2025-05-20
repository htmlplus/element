import * as CONSTANTS from '../../../constants/index.js';
import { HTMLPlusElement } from '../../../types/index.js';
import { host } from '../host.js';

export type ContextBaseConfig = {
  instance: HTMLPlusElement;
  namespace: string;
  sub?: string;
};

export abstract class ContextBase<Config extends ContextBaseConfig> {
  protected config: Config;

  protected get $root(): Window {
    return window;
  }

  public get $element(): HTMLElement {
    return host(this.config.instance);
  }

  public get instance(): HTMLPlusElement {
    return this.config.instance;
  }

  protected get namespace(): string {
    return `${CONSTANTS.KEY}:${this.config.namespace}`;
  }

  protected get sub(): string | undefined {
    return this.config.sub ? `${this.namespace}:${this.config.sub}` : undefined;
  }

  protected get events() {
    return {
      namespace_consumer_presence: `${this.namespace}:consumer:presence`,
      namespace_provider_presence: `${this.namespace}:provider:presence`,
      sub_consumer_presence: `${this.sub}:consumer:presence`,
      sub_provider_presence: `${this.sub}:provider:presence`
    };
  }

  constructor(config: Config) {
    this.config = Object.assign({}, config);
  }
}
