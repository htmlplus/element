import * as CONSTANTS from '../../constants/index.js';
import { HTMLPlusElement } from '../../types/index.js';
import { call } from './call.js';
import { getTag } from './getTag.js';
import { shadowRoot } from './shadowRoot.js';
import { task } from './task.js';
import { render } from './uhtml.js';

/**
 * Updates the DOM with a scheduled task.
 * @param target The element instance.
 * @param name Property/State name.
 * @param previous The previous value of Property/State.
 * @param callback Invoked when the rendering phase is completed.
 */
export const request = (
  target: HTMLPlusElement,
  name?: string,
  previous?: any,
  callback?: (skipped: boolean) => void
): void => {
  // Creates/Gets a stacks.
  const stacks = (target[CONSTANTS.API_STACKS] ||= new Map());

  // Creates/Updates a stack.
  const stack = stacks.get(name) || { callbacks: [], previous };

  // Adds the callback to the stack, if exists.
  callback && stack.callbacks.push(callback);

  // Stores the stack.
  stacks.set(name, stack);

  // Defines a handler.
  const handler = () => {
    // Skips the rendering phase if DOM isn't ready.
    if (!target[CONSTANTS.API_CONNECTED]) return;

    // Calculates the states to pass into lifecycles' callbacks.
    const states = new Map(
      Array.from(stacks)
        .filter((stack: any) => stack[0])
        .map((stack: any) => [stack[0], stack[1].previous])
    );

    // Calls the lifecycle's callback before the rendering phase.
    call(target, CONSTANTS.LIFECYCLE_UPDATE, states);

    // Renders template to the DOM.
    render(shadowRoot(target), () => call(target, CONSTANTS.METHOD_RENDER));

    // Invokes requests' callback.
    stacks.forEach((state) => {
      state.callbacks.forEach((callback, index, callbacks) => {
        callback(callbacks.length - 1 != index);
      });
    });

    // TODO
    (() => {
      const raw = target.constructor[CONSTANTS.STATIC_STYLE];

      if (!raw) return;

      const regex1 = /this-([\w-]+)(?:-([\w-]+))?/g;
      const regex2 = /(\s*\w+\s*:\s*(undefined|null)\s*;?)/g;
      const regex3 = /global\s+[^{]+\{[^{}]*\{[^{}]*\}[^{}]*\}|global\s+[^{]+\{[^{}]*\}/g;

      const hasGlobal = raw.includes('global');
      const hasVariable = raw.includes('this-');

      let localSheet = target[CONSTANTS.API_STYLE];
      let globalSheet = target.constructor[CONSTANTS.API_STYLE];

      if (!hasVariable && localSheet) return;

      const parsed = raw
        .replace(regex1, (match, key) => {
          let value = target as any;

          for (const section of key.split('-')) {
            value = value?.[section];
          }

          return value;
        })
        .replace(regex2, '');

      if (!localSheet) {
        localSheet = new CSSStyleSheet();

        target[CONSTANTS.API_STYLE] = localSheet;

        shadowRoot(target)!.adoptedStyleSheets.push(localSheet);
      }

      const localStyle = parsed.replace(regex3, '');

      localSheet.replaceSync(localStyle);

      if (!hasGlobal || globalSheet) return;

      if (!globalSheet) {
        globalSheet = new CSSStyleSheet();

        target.constructor[CONSTANTS.API_STYLE] = globalSheet;

        document.adoptedStyleSheets.push(globalSheet);
      }

      const globalStyle = parsed
        ?.match(regex3)
        ?.join('')
        ?.replaceAll('global', '')
        ?.replaceAll(':host', getTag(target)!);

      globalSheet.replaceSync(globalStyle);
    })();

    // Calls the lifecycle's callback after the rendering phase.
    call(target, CONSTANTS.LIFECYCLE_UPDATED, states);

    // Clears stacks.
    stacks.clear();

    // TODO: related to the @Watch decorator.
    target[CONSTANTS.API_RENDER_COMPLETED] = true;
  };

  // Creates/Gets a micro task function.
  target[CONSTANTS.API_REQUEST] ||= task({ handler });

  // Calls the micro task.
  call(target, CONSTANTS.API_REQUEST);
};
