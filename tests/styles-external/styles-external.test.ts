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

	it('should apply host style', () => {
		expect(getComputedStyle(element).display).toBe('block');
	});

	it('should apply div style', () => {
		const div = element.shadowRoot?.querySelector('div') as HTMLDivElement;

		const width = getComputedStyle(div).width;

		expect(width).toBe('50px');
	});
});
