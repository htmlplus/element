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
      <host
        value={this}
        class="test-class"
        onClick={this.handleHostClick}
      >
        <h1>{this.title}</h1>

        <p>Content</p>

        <button onClick={this.handleButtonClick}>
          Click
        </button>

        {this.header && <header />}

        {this.footer && <footer />}

        {this.href ? <a href={this.href} /> : <span />}

        {this.src ? <img src={this.src} /> : <span>No image</span>}

				<input tabIndex={5} disabled={false} readonly={true} required aria-disabled="false" />
      </host>
    );
  }
}
