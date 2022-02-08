import { host } from '../utils';

// TODO: merge types
export function query<K extends keyof HTMLElementTagNameMap>(target, selectors: K): HTMLElementTagNameMap[K] | null;
export function query<K extends keyof SVGElementTagNameMap>(target, selectors: K): SVGElementTagNameMap[K] | null;
export function query<E extends Element = Element>(target, selectors: string): E | null;
export function query(target, selectors) {
  return host(target)?.shadowRoot?.querySelector(selectors);
}
