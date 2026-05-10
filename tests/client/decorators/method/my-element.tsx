import { Element, Method } from '@htmlplus/element';

@Element()
export class MyElement {
	internalProperty = 'htmlplus';

	@Method()
	exposedMethod() {}

	internalMethod() {}

	@Method()
	caseSensitiveMethod() {}

	@Method()
	getInstance() {
		return this;
	}

	@Method()
	echoParameters(...parameters) {
		return parameters;
	}

	@Method()
	syncMethod() {}

	@Method()
	async asyncMethod() {}
}

declare global {
	interface HTMLElementTagNameMap {
		'my-element': HTMLElement & MyElement;
	}
}
