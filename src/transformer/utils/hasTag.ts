import type ts from 'typescript';

import { getTags } from './getTags';

export const hasTag = (node: ts.Node, name: string): boolean => getTags(node, name).length > 0;
