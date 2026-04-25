import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import './my-element';

describe('Method', () => {
	let element: HTMLElementTagNameMap['my-element'];

	beforeEach(() => {
		element = createElement('my-element', document.body);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('should expose decorated methods', () => {
		expect(element.exposedMethod).toBeDefined();
	});

	it('should not expose non-decorated methods', () => {
		expect(element.internalMethod).toBeUndefined();
	});

	it('should expose methods as functions', () => {
		expect(element.exposedMethod).toBeTypeOf('function');
	});

	it('should not expose case-sensitive method name in keys', () => {
		const methodName = element.caseSensitiveMethod.name.toUpperCase();
		const keys = Object.keys(element).map((key) => key.toUpperCase());
		expect(keys).not.toContain(methodName);
	});

	it('should preserve instance binding', () => {
		const instance = element.getInstance();
		expect(instance.internalProperty).toEqual('htmlplus');
	});

	it('should pass parameters correctly', () => {
		const param1 = 'htmlplus';
		const param2 = 1;
		const param3 = [1, 2, 3];

		const result = element.echoParameters(param1, param2, param3);

		expect(result[0]).toBe(param1);
		expect(result[1]).toBe(param2);
		expect(result[2]).toBe(param3);
	});

	it('should return non-promise for sync methods', () => {
		expect(element.syncMethod()).not.toBeInstanceOf(Promise);
	});

	it('should return promise for async methods', () => {
		expect(element.asyncMethod()).toBeInstanceOf(Promise);
	});
});
