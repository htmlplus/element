import { Bind, Element } from '@htmlplus/element';

@Element()
export class MyElement {
	@Bind()
	bind() {
		return this;
	}

	unbind() {
		return this;
	}

	render() {
		return (
			<div>
				<button id="bind" type="button" onClick={this.bind}>
					Bind
				</button>
				<button id="unbind" type="button" onClick={this.unbind}>
					Unbind
				</button>
			</div>
		);
	}
}
