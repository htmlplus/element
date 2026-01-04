import { beforeEach,afterEach, describe, expect, it} from 'vitest';

import './my-element';
import { MyElement } from './my-element';

describe('Method', () => {
	let element: any;
	beforeEach(() => {
		element = document.body.appendChild(document.createElement('my-element'));
	});
	afterEach(() => {
		document.body.innerHTML = '';
	});

	 it('should expose method when use decorator method', () => {
		expect(element.public).toBeDefined()
	});

	it('should not expose method when dont use decorator method', () => {
		expect(element.private).toBeUndefined()
	});

	it("method should be a function",()=>{
		  expect(element.public).toBeTypeOf('function')
	})
	it("",()=>{
		const methodName = element.caseSensitive.name.toUpperCase();
    const keys = Object.keys(element).map(key => key.toUpperCase());
    expect(keys).not.toContain(methodName);
	});

	it("",()=>{
		const instance = element.binding()
		expect(instance.internalProperty).toEqual("htmlplus")
	});

	it("should have the same parameters",()=>{
		const param1 = "htmlplus"
		const param2 = 1
		const param3 = [1,2,3];
		const instance = element.parameterChecking(param1,param2,param3)
		expect(instance[0]).toBe(param1);
		expect(instance[1]).toBe(param2);
		expect(instance[2]).toBe(param3);
	});

	it("",()=>{
		expect(element.syncFunction()).not.toBeInstanceOf(Promise)
	});

	it("",()=>{
		expect(element.asyncFunction()).toBeInstanceOf(Promise)
	});
})
