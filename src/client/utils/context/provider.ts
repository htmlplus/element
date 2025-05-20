import * as CONSTANTS from '../../../constants/index.js';
import { wrapMethod } from '../wrapMethod.js';
import { ContextBase, ContextBaseConfig } from './base.js';
import { ContextConsumer } from './consumer.js';
import { Logger } from './logger.js';

export type ContextProviderConfigs = ContextBaseConfig & {
  getState?: () => unknown;
  onAttach?: (consumer: ContextConsumer) => void;
  onChange?: (consumer: ContextConsumer) => void;
  onDetach?: (consumer: ContextConsumer) => void;
  onInitialize?: () => void;
  onTerminate?: () => void;
  onUpdate?: () => void;
};

// @Logger
export class ContextProvider extends ContextBase<ContextProviderConfigs> {
  private children = new Map<ContextConsumer, { isFromSub: boolean }>();

  private isInitialized: boolean = false;

  private state?: unknown;

  public get consumers(): ContextConsumer[] {
    return Array.from(this.children.keys());
  }

  public get initialized(): boolean {
    return this.isInitialized;
  }

  constructor(configs: ContextProviderConfigs) {
    super(configs);

    this.handleConsumerPresence = this.handleConsumerPresence.bind(this);

    this.lifecycle();
  }

  public attach(consumer: ContextConsumer, meta: { isFromSub: boolean }): void {
    if (!this.isInitialized) return;

    if (this.children.has(consumer)) return;

    // stores Consumer instance
    this.children.set(consumer, meta);

    this.config.onAttach?.(consumer);

    this.config.onChange?.(consumer);

    // informs Consumer for the connection
    consumer.attach(this);

    if (this.config.getState) {
      this.update(this.config.getState(), consumer, true);
    }
  }

  // Call when a consumer is disconnected
  public detach(consumer: ContextConsumer): void {
    if (!this.isInitialized) return;

    if (!this.children.has(consumer)) return;

    this.children.delete(consumer);

    this.config.onDetach?.(consumer);

    this.config.onChange?.(consumer);
  }

  public initialize(): void {
    if (this.isInitialized) return;

    this.isInitialized = true;

    // listens on CONSUMER_PRESENCE event on itself element
    this.$element.addEventListener(
      this.events.namespace_consumer_presence,
      this.handleConsumerPresence
    );

    if (this.sub) {
      // listens on SUB_CONSUMER_PRESENCE event on the root element if SUB is set
      this.$root.addEventListener(this.events.sub_consumer_presence, this.handleConsumerPresence);
    }

    this.config.onInitialize?.();

    // triggers PROVIDER_PRESENCE event on the root
    this.$root.dispatchEvent(new CustomEvent(this.events.namespace_provider_presence));

    if (this.sub) {
      // triggers SUB_PROVIDER_PRESENCE event on the root if SUB is set
      this.$root.dispatchEvent(new CustomEvent(this.events.sub_provider_presence));
    }
  }

  public terminate(): void {
    if (!this.isInitialized) return;

    this.isInitialized = false;

    this.$element.removeEventListener(
      this.events.namespace_consumer_presence,
      this.handleConsumerPresence
    );

    if (this.sub) {
      this.$root.removeEventListener(
        this.events.sub_consumer_presence,
        this.handleConsumerPresence
      );
    }

    this.config.onTerminate?.();

    this.children.forEach((meta, consumer) => consumer.detach());

    this.children.clear();
  }

  public update(state: unknown, consumer?: ContextConsumer, force?: boolean): void {
    if (!this.isInitialized) return;

    if (this.state === state && !force) return;

    this.state = state;

    this.config.onUpdate?.();

    if (consumer) {
      consumer.handleUpdate(state);
    } else {
      this.children.forEach((meta, consumer) => consumer.handleUpdate(state));
    }
  }

  public setSub(sub?: string): void {
    if (!this.isInitialized) return;

    if (this.config.sub === sub) return;

    if (this.sub) {
      this.$root.removeEventListener(
        this.events.sub_consumer_presence,
        this.handleConsumerPresence
      );
    }

    // Notify consumers that the provider has disconnected
    for (const [consumer, meta] of this.children.entries()) {
      if (!meta.isFromSub) continue;

      consumer.detach();

      this.children.delete(consumer);
    }

    this.config.sub = sub;

    if (!this.sub) return;

    // listens on SUB_CONSUMER_PRESENCE event on the root element if SUB is set
    this.$root.addEventListener(this.events.sub_consumer_presence, this.handleConsumerPresence);

    // triggers SUB_PROVIDER_PRESENCE event on the root if SUB is set
    this.$root.dispatchEvent(new CustomEvent(this.events.sub_provider_presence));
  }

  private lifecycle(): void {
    wrapMethod('after', this.config.instance, CONSTANTS.LIFECYCLE_CONNECTED, () => {
      this.initialize();
    });

    wrapMethod('after', this.config.instance, CONSTANTS.LIFECYCLE_UPDATE, (changes) => {
      if (changes.has(this.config.sub)) {
        this.setSub(this[this.config.sub!]);
      }
      if (this.config.getState) {
        this.update(this.config.getState());
      }
    });

    wrapMethod('after', this.config.instance, CONSTANTS.LIFECYCLE_DISCONNECTED, () => {
      this.terminate();
    });
  }

  // TODO: catched CONSUMER_PRESENCE/SUB_CONSUMER_PRESENCE event
  private handleConsumerPresence(event: Event): void {
    // call stop propagation
    event.stopPropagation();

    // TODO
    event.preventDefault();

    // TODO
    const consumer = (event as any).detail as ContextConsumer;

    this.attach(consumer, {
      isFromSub: event.currentTarget == window
    });
  }
}
