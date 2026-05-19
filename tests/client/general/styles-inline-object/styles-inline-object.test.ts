import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import './my-element';

describe('styles-inline-object', () => {
	let element: HTMLElement;

	beforeEach(async () => {
		element = createElement('my-element', document.body);
		await element.connected();
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('should apply inline styles as object to the host element', () => {
		expect(getComputedStyle(element).display).toBe('block');
	});

	it('should apply inline styles as object to shadow content', () => {
		const div = element.shadowQuery('div');

		expectExists(div);

		const width = getComputedStyle(div).width;

		expect(width).toBe('50px');
	});
});
