import { fireEvent } from '@testing-library/dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MyElement } from './my-element';

describe('JSX', () => {
	const hostClickSpy = vi.spyOn(MyElement.prototype, 'handleHostClick');
	const buttonClickSpy = vi.spyOn(MyElement.prototype, 'handleButtonClick');

	let element: HTMLElement;

	beforeEach(async () => {
		element = createElement('my-element', document.body);

		await element.connected();

		hostClickSpy.mockClear();
		buttonClickSpy.mockClear();
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('should render title inside h1', () => {
		const h1 = element.shadowQuery('h1');

		expect(h1?.textContent).toBe('Title');
	});

	it('should render header when header is true', async () => {
		const header = element.shadowQuery('header');

		expect(header).not.toBeNull();
	});

	it('should NOT render footer when false', async () => {
		const footer = element.shadowQuery('footer');

		expect(footer).toBeNull();
	});

	it('should render link when href exists', async () => {
		const a = element.shadowQuery('a');

		expect(a).not.toBeNull();

		expect(a?.href).toBe('https://example.com/');
	});

	it('should render fallback when image missing', async () => {
		const span = element.shadowQuery('span');

		expect(span?.textContent).toContain('No image');
	});

	it('should call host click handler', async () => {
		fireEvent.click(element);

		await nextTick();

		expect(hostClickSpy).toHaveBeenCalledTimes(1);
	});

	it('should call button click handler', async () => {
		const button = element.shadowQuery('button');

		expectExists(button);

		fireEvent.click(button);

		await nextTick();

		expect(buttonClickSpy).toHaveBeenCalledTimes(1);
	});

	it.skip('should NOT render false as text content', async () => {
		const div = element.shadowQuery('div.false');

		expect(div?.textContent).toBe('');
	});

	it.skip('should NOT render true as text content', async () => {
		const div = element.shadowQuery('div.true');

		expect(div?.textContent).toBe('');
	});

	it('should preserve input attributes', async () => {
		const input = element.shadowQuery('input');

		expect(input).toBeTruthy();
		expect(input?.tabIndex).toBe(-1);
		expect(input?.disabled).toBe(false);
		expect(input?.required).toBe(true);
		expect(input?.getAttribute('aria-disabled')).toBe('false');
	});

	it('should support native class attribute', async () => {
		const div = element.shadowQuery('.class-attr');

		expect(div).toHaveClass('class-attr');
	});

	it('should support className attribute', async () => {
		const div = element.shadowQuery('.class-name');

		expect(div).toHaveClass('class-name');
	});
});
