import type t from '@babel/types';

import * as CONSTANTS from '@/constants';

export const extractAttribute = (property: t.ClassProperty): string | undefined => {
	try {
		// biome-ignore lint: Keep using `any` type because of complexity
		return (property as any).decorators
			.find((decorator) => decorator.expression.callee.name === CONSTANTS.DECORATOR_PROPERTY)
			.expression.arguments.at(0)
			.properties.find((property) => property.key.name === 'attribute').value.value;
	} catch {}
};
