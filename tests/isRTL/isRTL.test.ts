import { afterEach, describe, expect, it } from 'vitest';

import './my-element';

describe('isRTL', () => {
	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('should default to "false" when no direction is set', async () => {
		const element = document.createElement('my-element');

		document.body.appendChild(element);

		await nextTick();

		expect(element.shadowRoot.textContent.trim()).toBe('false');
	});

	it('should reflect "true" when direction is set to "rtl" before append', async () => {
		const element = document.createElement('my-element');

		element.setAttribute('dir', 'rtl');

		document.body.appendChild(element);

		await nextTick();

		expect(element.shadowRoot.textContent.trim()).toBe('true');
	});

	it('should remain "false" initially when direction is set after append', async () => {
		const element = document.createElement('my-element');

		document.body.appendChild(element);

		await nextTick();

		element.setAttribute('dir', 'rtl');

		expect(element.shadowRoot.textContent.trim()).toBe('false');
	});
});
