import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import './my-element';

describe('styles', () => {
	let element: HTMLElement;

	beforeEach(() => {
		element = document.body.appendChild(document.createElement('my-element'));
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('applies inline styles directly to the host element', () => {
		const styles = getComputedStyle(element);
		expect(styles.fontSize).toBe('15px');
	});

	it('inherits font-size from the host (global context)', () => {
		const el = element.shadowRoot.querySelector('#inherited-text');
		const styles = getComputedStyle(el);
		expect(styles.fontSize).toBe('15px');
	});

	it('applies element-scoped styles defined via static style', () => {
		const el = element.shadowRoot.querySelector('#scoped-style-text');
		expect(el).toHaveStyle({ fontSize: '16px' });
	});

	it('prioritizes inline styles over inherited styles', () => {
		const el = element.shadowRoot.querySelector('#inline-override-text');
		expect(el).toHaveStyle({ fontSize: '17px' });
	});

	it('applies global style to host element', () => {
		const styles = getComputedStyle(element);
		expect(styles.padding).toBe('10px');
	});
});
