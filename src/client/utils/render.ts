import { html, render as renderer } from 'uhtml';

import * as CONSTANTS from '../../configs/constants.js';
import { call, host } from '../utils/index.js';

export const render = (target): void => {
  const element = host(target);
  const styles = target.constructor[CONSTANTS.STATIC_STYLES];
  renderer(element.shadowRoot!, () => {
    const markup = call(target, CONSTANTS.METHOD_RENDER);
    if (!styles && !markup) return html``;
    if (!styles) return markup;
    if (!markup) return html`<style>${styles}</style>`;
    return html`<style>${styles}</style>${markup}`;
  });
};
