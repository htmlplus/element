import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import './my-element';

describe('styles-external', () => {
	let element: HTMLElement;

	beforeEach(() => {
		element = createElement('my-element', document.body);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('should apply display, width, and height styles to the host element',() => {
		expect(element).toHaveStyle({
			display: 'block',
			width: '100px',
			height: '100px',
		});
	});
});
