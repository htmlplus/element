import { fireEvent } from '@testing-library/dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MyElement } from './my-element';

describe('State', () => {
	const renderSpy = vi.spyOn(MyElement.prototype, 'render');

	let element: HTMLElement;

	beforeEach(async () => {
		element = createElement('my-element', document.body);

		await element.connected();

		renderSpy.mockClear();
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('should render the initial value', () => {
		expect(element.shadowRoot?.textContent.trim()).toBe('5');
	});

	it('should increment the value by 1 when button is clicked', async () => {
		const button = element.shadowQuery('button');

		expectExists(button);

		fireEvent.click(button);

		await nextTick();

		expect(element.shadowRoot?.textContent.trim()).toBe('6');
	});

	it('should increment the value correctly after multiple clicks', async () => {
		const button = element.shadowQuery('button');

		expectExists(button);

		for (let i = 0; i < 10; i++) {
			fireEvent.click(button);
		}

		await nextTick();

		expect(element.shadowRoot?.textContent.trim()).toBe('15');
	});

	it('should only call render once even after multiple clicks', async () => {
		const button = element.shadowQuery('button');

		expectExists(button);

		for (let i = 0; i < 10; i++) {
			fireEvent.click(button);
		}

		await nextTick();

		expect(renderSpy).toHaveBeenCalledTimes(1);
	});

	it('should not expose internal state as a public property', () => {
		const name = 'currentCount';

		const has = Object.keys(element).some((key) => key.toLowerCase() === name.toLowerCase());

		expect(has).toBe(false);
	});
});
