import { host } from '../utils';

// TODO: merge types
export function queryAll<K extends keyof HTMLElementTagNameMap>(
  target,
  selectors: K
): NodeListOf<HTMLElementTagNameMap[K]>;
export function queryAll<K extends keyof SVGElementTagNameMap>(
  target,
  selectors: K
): NodeListOf<SVGElementTagNameMap[K]>;
export function queryAll<E extends Element = Element>(target, selectors: string): NodeListOf<E>;
export function queryAll(target, selectors) {
  return host(target)?.shadowRoot?.querySelectorAll(selectors);
}
