import core from '@babel/generator';
import type t from '@babel/types';

const generator = ((core as unknown as { default: unknown }).default || core) as typeof core;

export const print = (ast?: t.Node): string => {
	if (!ast) return '';
	return generator(ast, { decoratorsBeforeExport: true }).code;
};
