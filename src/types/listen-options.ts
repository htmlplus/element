export interface ListenOptions {
  target?: 'body' | 'document' | 'window';
  once?: boolean;
  passive?: boolean;
  signal?: AbortSignal;
  capture?: boolean;
}