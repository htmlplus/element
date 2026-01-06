import type { JSX as JSXReact } from 'react/jsx-runtime';

type WithPart<T> = T & {
	part?: string;
};

type IntrinsicElementsWithPart = {
	[K in keyof JSXReact.IntrinsicElements]: WithPart<Omit<JSXReact.IntrinsicElements[K], 'ref'>>;
};

declare namespace JSX {
	interface IntrinsicElements extends IntrinsicElementsWithPart {
		host: WithPart<JSXReact.IntrinsicElements['div']> & {
			[key: string]: unknown;
		};
		slot: WithPart<JSXReact.IntrinsicElements['slot']> & {
			onSlotChange?: (event: Event) => void;
		};
	}
}
