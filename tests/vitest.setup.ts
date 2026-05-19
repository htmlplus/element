import '@testing-library/jest-dom';

import { expect } from 'vitest';

globalThis.createElement = <K extends keyof HTMLElementTagNameMap>(
	tagName: K,
	appendTo?: HTMLElement
): HTMLElementTagNameMap[K] => {
	const element = document.createElement(tagName);
	appendTo?.appendChild(element);
	return element;
};

globalThis.expectExists = <T>(value: T | null | undefined): asserts value is T => {
	expect(value).toBeTruthy();
};

globalThis.nextTick = () => Promise.resolve();

globalThis.wait = (delay: number = 0) => new Promise((resolve) => setTimeout(resolve, delay));

HTMLElement.prototype.shadowQuery = function (selector: string) {
	return this.shadowRoot?.querySelector(selector) ?? null;
};

HTMLElement.prototype.connected = async () => {
	await nextTick();
};

declare global {
	var createElement: <K extends keyof HTMLElementTagNameMap>(
		tagName: K,
		appendTo?: HTMLElement
	) => HTMLElementTagNameMap[K];

	var expectExists: <T>(value: T | null | undefined) => asserts value is T;

	var nextTick: () => Promise<void>;

	var wait: (delay?: number) => Promise<void>;

	interface HTMLElement {
		shadowQuery<K extends keyof HTMLElementTagNameMap>(
			selector: K
		): HTMLElementTagNameMap[K] | null;
		shadowQuery<E extends Element = Element>(selector: string): E | null;
		connected(): Promise<void>;
	}
}
