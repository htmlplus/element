import { afterEach, describe, expect, it } from 'vitest';

import './my-element';

describe('Direction', () => {
	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('should default to "ltr" when no direction is set', async () => {
		const element = document.createElement('my-element');

		document.body.appendChild(element);

		await nextTick();

		expect(element.shadowRoot.textContent.trim()).toBe('ltr');
	});

	it('should reflect "rtl" when direction is set to "rtl" before append', async () => {
		const element = document.createElement('my-element');

		element.setAttribute('dir', 'rtl');

		document.body.appendChild(element);

		await nextTick();

		expect(element.shadowRoot.textContent.trim()).toBe('rtl');
	});

	it('should remain "ltr" initially when direction is set after append', async () => {
		const element = document.createElement('my-element');

		document.body.appendChild(element);

		await nextTick();

		element.setAttribute('dir', 'rtl');

		expect(element.shadowRoot.textContent.trim()).toBe('ltr');
	});
});
