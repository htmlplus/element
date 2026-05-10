import { Element } from '@htmlplus/element';

@Element()
export class MyElement {
	static style = `
		global my-element {
			display: block;
		}

		global my-element::part(root) {
			width: 50px;
		}
	`;

	render() {
		return <div part="root"></div>;
	}
}
