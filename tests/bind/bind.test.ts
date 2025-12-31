import { fireEvent } from '@testing-library/dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MyElement } from './my-element';

describe('Bind', () => {
	let element: HTMLElement;

	beforeEach(() => {
		element = document.body.appendChild(document.createElement('my-element'));
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it.skip('', async () => {
		const button = element.shadowRoot.querySelector('#bind');

		const spy = vi.spyOn(MyElement.prototype, 'bind');

		fireEvent.click(button);

		await nextTick();

		expect(spy).toHaveBeenCalledTimes(1);

		spy.mockRestore();
	});

	it.skip('', async () => {
		const button = element.shadowRoot.querySelector('#bind');

		const spy = vi.spyOn(MyElement.prototype, 'bind');

		fireEvent.click(button);

		await nextTick();

		expect(spy.mock.results[0].value).not.toBeUndefined();

		spy.mockRestore();
	});

	it.skip('', async () => {
		const button = element.shadowRoot.querySelector('#unbind');

		const spy = vi.spyOn(MyElement.prototype, 'unbind');

		fireEvent.click(button);

		await nextTick();

		expect(spy).toHaveBeenCalledTimes(1);

		spy.mockRestore();
	});

	it.skip('', async () => {
		const button = element.shadowRoot.querySelector('#unbind');

		const spy = vi.spyOn(MyElement.prototype, 'unbind');

		fireEvent.click(button);

		await nextTick();

		expect(spy.mock.results[0].value).toBeUndefined();

		spy.mockRestore();
	});
});
