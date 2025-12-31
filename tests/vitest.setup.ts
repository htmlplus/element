import '@testing-library/jest-dom';

globalThis.createElement = <K extends keyof HTMLElementTagNameMap>(
	tagName: K,
	appendTo?: HTMLElement
): HTMLElementTagNameMap[K] => {
	const element = document.createElement(tagName);
	appendTo?.appendChild(element);
	return element;
};

globalThis.nextTick = () => Promise.resolve();

globalThis.wait = (delay: number = 0) => new Promise((resolve) => setTimeout(resolve, delay));

declare global {
	var createElement: <K extends keyof HTMLElementTagNameMap>(
		tagName: K,
		appendTo?: HTMLElement
	) => HTMLElementTagNameMap[K];
	var nextTick: () => Promise<void>;
	var wait: (delay?: number) => Promise<void>;
}
