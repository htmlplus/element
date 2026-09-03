import ts from 'typescript';

import * as CONSTANTS from '@/constants';

import { getTypeChecker } from '../core';
import type { TransformerContext } from '../transformer.types';

export const property = (context: TransformerContext): void => {
	for (const property of context.properties) {
		const expression = property.decorator.expression;

		if (!ts.isCallExpression(expression)) continue;

		const options = expression.arguments.at(0);

		const object = options && ts.isObjectLiteralExpression(options) ? options : undefined;

		const value = object?.properties.find(
			(property) => property.name && ts.isIdentifier(property.name) && property.name.text === 'type'
		);

		if (value) continue;

		const checker = getTypeChecker(property.node);

		const type = extractTypeFlags(checker.getTypeAtLocation(property.node), checker);

		if (object) {
			context.script.appendRight(expression.expression.end + 2, ` type: ${type},`);
		} else {
			context.script.appendRight(expression.expression.end + 1, `{ type: ${type} }`);
		}
	}
};

const extractTypeFlags = (type: ts.Type, checker: ts.TypeChecker): number => {
	if (type.isUnionOrIntersection()) {
		let result = 0;

		for (const member of type.types) {
			if (
				type.isIntersection() &&
				member.flags & ts.TypeFlags.Object &&
				!member.getProperties().length
			)
				continue;

			result |= extractTypeFlags(member, checker);
		}

		return result || CONSTANTS.TYPE_ANY;
	}

	if (type.flags & ts.TypeFlags.BooleanLike) return CONSTANTS.TYPE_BOOLEAN;
	if (type.flags & ts.TypeFlags.BigIntLike) return CONSTANTS.TYPE_BIGINT;
	if (type.flags & ts.TypeFlags.NumberLike) return CONSTANTS.TYPE_NUMBER;
	if (type.flags & ts.TypeFlags.StringLike) return CONSTANTS.TYPE_STRING;
	if (type.flags & ts.TypeFlags.Null) return CONSTANTS.TYPE_NULL;
	if (type.flags & ts.TypeFlags.VoidLike) return CONSTANTS.TYPE_UNDEFINED;

	if (!(type.flags & ts.TypeFlags.Object)) return CONSTANTS.TYPE_ANY;

	if (checker.isArrayType(type)) return CONSTANTS.TYPE_ARRAY;
	if (checker.isTupleType(type)) return CONSTANTS.TYPE_ARRAY;
	if (type.getSymbol()?.name === 'Date') return CONSTANTS.TYPE_DATE;
	if (type.getCallSignatures().length) return CONSTANTS.TYPE_FUNCTION;
	return CONSTANTS.TYPE_OBJECT;
};
