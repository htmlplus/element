import type ts from 'typescript';

import { findDecorator } from './findDecorator';

export const hasDecorator = (node: ts.Node, name: string): boolean => {
	return !!findDecorator(node, name);
};
