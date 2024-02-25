import * as CONSTANTS from '../../constants/index.js';
import { PlusElement } from '../../types';
import { call } from './call.js';
import { getStyles } from './getStyles.js';
import { shadowRoot } from './shadowRoot.js';
import { task } from './task.js';
import { html, render } from './uhtml.js';

/**
 * Update the DOM with a scheduled task.
 * @param target The element instance.
 * @param name Property/State name.
 * @param previous The previous value of Property/State.
 * @param callback Invoked when the rendering phase is completed.
 */
export const request = (
  target: PlusElement,
  name?: string,
  previous?: any,
  callback?: (skipped: boolean) => void
): void => {
  // Create/Get a stacks.
  const stacks = (target[CONSTANTS.API_STACKS] ||= new Map());

  // Create/Update a stack.
  const stack = stacks.get(name) || { callbacks: [], previous };

  // Add the callback to the stack, if exists.
  callback && stack.callbacks.push(callback);

  // Store the stack.
  stacks.set(name, stack);

  // Define a handler.
  const handler = () => {
    // Skip the rendering phase if DOM isn't ready.
    if (!target[CONSTANTS.API_CONNECTED]) return;

    // Calculate the states to pass into lifecycles' callbacks.
    const states = new Map(
      Array.from(stacks)
        .filter((stack: any) => stack[0])
        .map((stack: any) => [stack[0], stack[1].previous])
    );

    // Call the lifecycle's callback before the rendering phase.
    call(target, CONSTANTS.LIFECYCLE_UPDATE, states);

    // Calculate the template.
    const template = () => {
      // Calculate the markup.
      const markup = call(target, CONSTANTS.METHOD_RENDER);

      // Calculate the styles.
      const styles = getStyles(target);

      // Return the markup if styles don't exist.
      if (!styles) return markup;

      // Return the markup and styles together.
      return html`<style>${styles}</style>${markup}`;
    };

    // Render template to the DOM.
    render(shadowRoot(target), template);

    // Invoke requests' callback.
    stacks.forEach((state) => {
      state.callbacks.forEach((callback, index, callbacks) => {
        callback(callbacks.length - 1 != index);
      });
    });

    // Call the lifecycle's callback after the rendering phase.
    call(target, CONSTANTS.LIFECYCLE_UPDATED, states);

    // Clear stacks.
    stacks.clear();

    // TODO: releated to the @Watch decorator.
    target[CONSTANTS.API_RENDER_COMPLETED] = true;
  };

  // Create/Get a micro task function.
  target[CONSTANTS.API_REQUEST] ||= task({ handler });

  // Call the micro task.
  call(target, CONSTANTS.API_REQUEST);
};
