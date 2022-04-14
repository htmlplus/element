import { html, render as renderer } from 'uhtml';

import * as CONSTANTS from '../../constants/index.js';
import { PlusElement } from '../../types/index.js';
import { call } from './call.js';
import { getStyles } from './get-styles.js';
import { host } from './host.js';

export const render = (target: PlusElement): void => {
  const element = host(target);
  renderer(element.shadowRoot!, () => {
    const markup = call(target, CONSTANTS.METHOD_RENDER);
    const styles = getStyles(target);
    if (!styles && !markup) return html``;
    if (!styles) return markup;
    if (!markup) return html`<style>${styles}</style>`;
    return html`<style>${styles}</style>${markup}`;
  });
};
