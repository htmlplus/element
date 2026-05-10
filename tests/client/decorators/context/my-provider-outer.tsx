import { Element, Method, Provider } from '@htmlplus/element';

@Element()
export class MyProviderOuter {
	@Provider('NAMESPACE')
	state = {
		value: 54321
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
		'my-provider-outer': HTMLElement & MyProviderOuter;
	}
}
