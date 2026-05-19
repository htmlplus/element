import { Element } from '@htmlplus/element';

@Element()
export class MyElement {
	static style = `
		:host {
			display: block;
		}

		div {
			width: 50px;
		}
	`;

	render() {
		return <div></div>;
	}
}
