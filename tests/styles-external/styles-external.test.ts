import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import './my-element';

describe('styles-external', () => {
	let element: HTMLElement;

	beforeEach(() => {
		element = document.body.appendChild(document.createElement('my-element'));
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('should apply display, width, and height styles to the host element',() => {
		const style = getComputedStyle(element);
		expect(style.display).toBe('block');
		expect(style.height).toBe('100px');
		expect(style.width).toBe('100px');
	});
});
