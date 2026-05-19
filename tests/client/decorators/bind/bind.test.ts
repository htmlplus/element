import { fireEvent } from '@testing-library/dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MyElement } from './my-element';

describe('Bind', () => {
	const bindSpy = vi.spyOn(MyElement.prototype, 'unbind');
	const unbindSpy = vi.spyOn(MyElement.prototype, 'unbind');

	let element: HTMLElement;

	beforeEach(async () => {
		element = createElement('my-element', document.body);

		await element.connected();

		bindSpy.mockClear();
		unbindSpy.mockClear();
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it.skip('', async () => {
		const button = element.shadowQuery('#bind');

		expectExists(button);

		fireEvent.click(button);

		await nextTick();

		expect(bindSpy).toHaveBeenCalledTimes(1);
	});

	it.skip('', async () => {
		const button = element.shadowQuery('#bind');

		expectExists(button);

		fireEvent.click(button);

		await nextTick();

		expect(bindSpy.mock.results[0].value).not.toBeUndefined();
	});

	it.skip('', async () => {
		const button = element.shadowQuery('#unbind');

		expectExists(button);

		fireEvent.click(button);

		await nextTick();

		expect(unbindSpy).toHaveBeenCalledTimes(1);
	});

	it.skip('', async () => {
		const button = element.shadowQuery('#unbind');

		expectExists(button);

		fireEvent.click(button);

		await nextTick();

		expect(unbindSpy.mock.results[0].value).toBeUndefined();
	});
});
