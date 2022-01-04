export interface ListenOptions {
  target?: 'host' | 'body' | 'document' | 'window';
  once?: boolean;
  passive?: boolean;
  signal?: AbortSignal;
  capture?: boolean;
}
