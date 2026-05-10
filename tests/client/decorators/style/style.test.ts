import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import './my-element';

import { fireEvent } from '@testing-library/dom';

const PROPERTY_CASES = ['property-string', 'property-object', 'property-array'] as const;

const GETTER_CASES = ['getter-string', 'getter-object', 'getter-array'] as const;

const METHOD_CASES = ['method-string', 'method-object', 'method-array'] as const;

const ASYNC_CASES = ['async-string', 'async-object', 'async-array'] as const;

describe('style', () => {
	let element: HTMLElement;

	beforeEach(() => {
		element = createElement('my-element', document.body);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it.each([...PROPERTY_CASES, ...GETTER_CASES, ...METHOD_CASES, ...ASYNC_CASES])(
		'applies an initial font-size of 20px to "%s"',
		(id) => {
			const div = element.shadowRoot?.querySelector(`#${id}`);
			expect(div).toHaveStyle({ fontSize: '20px' });
		}
	);

	it.each([...GETTER_CASES, ...METHOD_CASES])(
		'updates "%s" font-size to 25px after a synchronous re-render',
		async (id) => {
			const button = element.shadowRoot?.querySelector('button');

			for (let i = 0; i < 5; i++) {
				fireEvent.click(button);
			}

			await nextTick();

			const div = element.shadowRoot?.querySelector(`#${id}`);

			expect(div).toHaveStyle({ fontSize: '25px' });
		}
	);

	it.each([...ASYNC_CASES])(
		'updates "%s" font-size to 25px after an asynchronous re-render',
		async (id) => {
			const button = element.shadowRoot?.querySelector('button');

			for (let i = 0; i < 5; i++) {
				fireEvent.click(button);
			}

			await wait();

			const div = element.shadowRoot?.querySelector(`#${id}`);

			expect(div).toHaveStyle({ fontSize: '25px' });
		}
	);
});
