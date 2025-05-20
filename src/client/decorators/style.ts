import * as CONSTANTS from '../../constants/index.js';
import { HTMLPlusElement } from '../../types/index.js';
import { shadowRoot, wrapMethod } from '../utils/index.js';

// TODO: check the logic

export function Style() {
  return function (target: HTMLPlusElement, key: PropertyKey) {
    const LAST = Symbol();

    const SHEET = Symbol();

    wrapMethod('before', target, CONSTANTS.LIFECYCLE_UPDATED, function () {
      let sheet = this[SHEET];

      let value = this[key];

      const update = (value?: Promise<unknown>) => (result: any) => {
        if (value && value !== this[LAST]) return;

        sheet.replaceSync(toCssString(result));

        this[LAST] = undefined;
      };

      if (!sheet) {
        sheet = new CSSStyleSheet();

        this[SHEET] = sheet;

        shadowRoot(this)?.adoptedStyleSheets.push(sheet);
      }

      if (typeof value === 'function') {
        value = value.call(this);
      }

      if (value instanceof Promise) {
        value.then(update((this[LAST] = value))).catch((error) => {
          throw new Error('TODO', { cause: error });
        });
      } else {
        update()(value);
      }
    });
  };
}

const toCssString = (input: any, parent?: string): string => {
  if (typeof input == 'string') {
    return input.trim();
  }

  if (Array.isArray(input)) {
    return input
      .map((item) => toCssString(item, parent))
      .filter(Boolean)
      .join('\n');
  }

  if (typeof input != 'object') return '';

  let result = '';

  for (const key of Object.keys(input)) {
    const value = input[key];

    const ignore = [null, undefined, false].includes(value);

    if (ignore) continue;

    const cssKey = key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);

    if (typeof value === 'object') {
      result += `${cssKey} {${toCssString(value, cssKey)}}`;
    } else {
      result += `${cssKey}: ${value};`;
    }
  }

  return parent ? result : `:host {${result}}`;
};
