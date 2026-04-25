import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import './my-element';

describe('style', () => {
	let element: HTMLElement;

	beforeEach(() => {
		element = document.body.appendChild(document.createElement('my-element'));
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	const cases = [
		'property-string',
		'property-object',
		'property-array',
		'getter-string',
		'getter-object',
		'getter-array',
		'method-string',
		'method-object',
		'method-array',
		'async-string',
		'async-object',
		'async-array'
	];

	it.each(cases)('sets font-size to 20px for #%s element', (id) => {
		const div = element.shadowRoot.querySelector(`#${id}`);
		expect(div).toHaveStyle({ fontSize: '20px' });
	});
});
