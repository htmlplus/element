import core from '@babel/traverse';

const traverse = ((core as unknown as { default: unknown }).default || core) as typeof core;

export const visitor = traverse;
