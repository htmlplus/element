import * as CONSTANTS from '../../../constants/index.js';
import { wrapMethod } from '../wrapMethod.js';
import { ContextBase, ContextBaseConfig } from './base.js';
import { Logger } from './logger.js';
import { ContextProvider } from './provider.js';

export type ContextConsumerConfigs = ContextBaseConfig & {
  setState?: (state: unknown) => void;
  onAttach?: () => void;
  onDetach?: () => void;
  onInitialize?: () => void;
  onTerminate?: () => void;
  onUpdate?: (state: unknown) => void;
};

// @Logger
export class ContextConsumer extends ContextBase<ContextConsumerConfigs> {
  private isAttached: boolean = false;

  private isInitialized: boolean = false;

  public provider?: ContextProvider;

  public get attached(): boolean {
    return !this.isAttached;
  }

  public get initialized(): boolean {
    return this.isInitialized;
  }

  public get siblings(): ContextConsumer[] {
    return this.provider?.consumers.filter((consumer) => consumer != this) || [];
  }

  constructor(configs: ContextConsumerConfigs) {
    super(configs);

    this.handleProviderPresence = this.handleProviderPresence.bind(this);

    this.lifecycle();
  }

  public attach(provider: ContextProvider): void {
    if (!this.isInitialized) return;

    if (this.provider == provider) return;

    this.unbind();

    this.provider = provider;

    this.config.onAttach?.();
  }

  public detach(): void {
    if (!this.isInitialized) return;

    if (!this.isAttached) return;

    this.bind();

    this.provider = undefined;

    this.config.onDetach?.();
  }

  public initialize(): void {
    if (this.isInitialized) return;

    this.isInitialized = true;

    this.bind();

    this.config.onInitialize?.();

    this.handleProviderPresence();
  }

  public terminate(): void {
    if (!this.isInitialized) return;

    this.isInitialized = false;

    this.unbind();

    this.provider?.detach(this);

    this.provider = undefined;

    this.config.onTerminate?.();
  }

  public setSub(sub?: string): void {
    if (!this.isInitialized) return;

    if (this.config.sub === sub) return;
  }

  public handleUpdate(state: unknown): void {
    this.config.setState?.(state);
    this.config.onUpdate?.(state);
  }

  private bind(): void {
    this.$root.addEventListener(
      this.events.namespace_provider_presence,
      this.handleProviderPresence
    );

    if (!this.sub) return;

    this.$root.addEventListener(this.events.sub_provider_presence, this.handleProviderPresence);
  }

  private unbind(): void {
    this.$root.removeEventListener(
      this.events.namespace_provider_presence,
      this.handleProviderPresence
    );

    if (!this.sub) return;

    this.$root.removeEventListener(this.events.sub_provider_presence, this.handleProviderPresence);
  }

  private lifecycle(): void {
    wrapMethod('after', this.config.instance, CONSTANTS.LIFECYCLE_CONNECTED, () => {
      this.initialize();
    });

    wrapMethod('after', this.config.instance, CONSTANTS.LIFECYCLE_UPDATE, (changes) => {
      if (changes.has(this.config.sub)) {
        this.setSub(this[this.config.sub!]);
      }
    });

    wrapMethod('after', this.config.instance, CONSTANTS.LIFECYCLE_DISCONNECTED, () => {
      this.terminate();
    });
  }

  private handleProviderPresence(): void {
    if (this.sub) {
      const wasNotCanceled = this.$element.dispatchEvent(
        new CustomEvent(this.events.sub_consumer_presence, {
          bubbles: true,
          cancelable: true,
          detail: this
        })
      );

      if (!wasNotCanceled) return;
    }

    this.$element.dispatchEvent(
      new CustomEvent(this.events.namespace_consumer_presence, {
        bubbles: true,
        detail: this
      })
    );
  }
}
