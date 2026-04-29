import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { MyElement } from './my-element';

MyElement;

describe('JSX', () => {
	let element: HTMLElement;

	beforeEach(() => {
		element = createElement('my-element', document.body);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('should render title inside h1', async () => {
		await customElements.whenDefined('my-element');

		const h1 = element.shadowRoot?.querySelector('h1');

		expect(h1?.textContent).toBe('Title');
	});

	it('should render header when header is true', async () => {
		await customElements.whenDefined('my-element');

		const header = element.shadowRoot?.querySelector('header');

		expect(header).not.toBeNull();
	});

	it('should NOT render footer when false', async () => {
		await customElements.whenDefined('my-element');

		const footer = element.shadowRoot?.querySelector('footer');

		expect(footer).toBeNull();
	});

	it('should render link when href exists', async () => {
		await customElements.whenDefined('my-element');

		const a = element.shadowRoot?.querySelector('a');

		expect(a).not.toBeNull();

		expect(a?.href).toBe('https://example.com/');
	});

	it('should render fallback when image missing', async () => {
		await customElements.whenDefined('my-element');

		const span = element.shadowRoot?.querySelector('span');

		expect(span?.textContent).toContain('No image');
	});

	// TODO
	// it('should call host click handler', async () => {
	// 	const spy = vi.spyOn(MyElement.prototype, 'handleHostClick');

	// 	await customElements.whenDefined('my-element');

	// 	fireEvent.click(element);

	// 	await nextTick();

	// 	expect(spy).toHaveBeenCalledTimes(1);

	// 	spy.mockRestore();
	// });

	// TODO
	// it('should call button click handler', async () => {
	// 	const spy = vi.spyOn(MyElement.prototype, 'handleButtonClick');

	// 	await customElements.whenDefined('my-element');

	//  const button = element.shadowRoot?.querySelector('button');

	// 	fireEvent.click(button);

	// 	await nextTick();

	// 	expect(spy).toHaveBeenCalledTimes(1);

	// 	spy.mockRestore();
	// });

	it.skip('should NOT render false as text content', async () => {
		await customElements.whenDefined('my-element');

		const div = element.shadowRoot?.querySelector('div.false');

		expect(div?.textContent).toBe('');
	});

	it.skip('should NOT render true as text content', async () => {
		await customElements.whenDefined('my-element');

		const div = element.shadowRoot?.querySelector('div.true');

		expect(div?.textContent).toBe('');
	});

	it('should preserve input attributes', async () => {
		await customElements.whenDefined('my-element');

		const input = element.shadowRoot?.querySelector('input') as HTMLInputElement;

		expect(input).toBeTruthy();
		expect(input.tabIndex).toBe(5);
		expect(input.disabled).toBe(false);
		expect(input.required).toBe(true);
		expect(input.getAttribute('aria-disabled')).toBe('false');
	});
});
