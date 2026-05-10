import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import './my-element';

describe('styles-inline-object', () => {
	let element: HTMLElement;

	beforeEach(() => {
		element = createElement('my-element', document.body);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('should apply inline styles as string to the host element', () => {
		expect(getComputedStyle(element).display).toBe('block');
	});

	it('should apply inline styles as string to shadow content', () => {
		const div = element.shadowRoot?.querySelector('div') as HTMLDivElement;

		const width = getComputedStyle(div).width;

		expect(width).toBe('50px');
	});
});
