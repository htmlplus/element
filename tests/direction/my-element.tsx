import { Direction, Element } from '@htmlplus/element';

@Element()
export class MyElement {
	@Direction()
	direction;

	render() {
		return <div>{this.direction}</div>;
	}
}
