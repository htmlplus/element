import { Element, Method, Provider } from '@htmlplus/element';

@Element()
export class MyProvider {
	@Provider('NAMESPACE')
	state = {
		value: 12345
	};

	@Method()
	getState() {
		return this.state;
	}

	@Method()
	setState(state) {
		this.state = state;
	}

	render() {
		return <slot />;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'my-provider': HTMLElement & MyProvider;
	}
}
