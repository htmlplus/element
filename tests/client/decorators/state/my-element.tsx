import { Element, State } from '@htmlplus/element';

@Element()
export class MyElement {
	@State()
	currentCount: number = 5;

	render() {
		return (
			<button type="button" onClick={() => this.currentCount++}>
				{this.currentCount}
			</button>
		);
	}
}
