import { Consumer, Element, Method } from '@htmlplus/element';

@Element()
export class MyConsumer {
	@Consumer('NAMESPACE')
	state;

	@Method()
	getState() {
		return this.state;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'my-consumer': HTMLElement & MyConsumer;
	}
}
