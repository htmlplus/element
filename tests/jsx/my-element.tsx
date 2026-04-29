import { Element } from '@htmlplus/element';

@Element()
export class MyElement {
	alt?: string;

	footer?: boolean = false;

	header?: boolean = true;

	href?: string = 'https://example.com/';

	src?: string;

	title?: string = 'Title';

	handleHostClick = () => {};

	handleButtonClick = () => {};

	render() {
		return (
			<host value={this} class="test-class">
				<h1>{this.title}</h1>

				<p>Content</p>

				<button type="button" onClick={this.handleButtonClick}>
					Click
				</button>

				<div className="false">{false}</div>
				<div className="true">{true}</div>

				{this.header && <header />}

				{this.footer && <footer />}

				{this.href ? <a href={this.href}>Link</a> : <span />}

				{this.src ? <img alt="" src={this.src} /> : <span>No image</span>}

				<input tabIndex="0" disabled={false} readonly={true} required aria-disabled="false" />
			</host>
		);
	}
}
