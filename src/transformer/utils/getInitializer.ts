import type t from '@babel/types';

export const getInitializer = (
	node?: t.Expression | null
): boolean | number | string | undefined => {
	// biome-ignore lint: Keep using `any` type because of complexity
	return node?.extra?.raw || node?.['value'];
};
