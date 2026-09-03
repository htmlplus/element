import { kebabCase } from 'change-case';
import ts from 'typescript';

import * as CONSTANTS from '@/constants';

import type {
	TransformerContext,
	TransformerEvent,
	TransformerMethod,
	TransformerProperty
} from '../transformer.types';
import { findDecorator, getDescription, getTags, hasDecorator } from '../utils';
import { getTypeChecker } from './program';

const readOptions = (decorator: ts.Decorator) => {
	const argument = ts.isCallExpression(decorator.expression)
		? decorator.expression.arguments[0]
		: undefined;

	if (!argument || !ts.isObjectLiteralExpression(argument)) return {};

	return Object.fromEntries(
		argument.properties.filter(ts.isPropertyAssignment).map((property) => [
			property.name.getText(),
			(() => {
				try {
					return JSON.parse(property.initializer.getText());
				} catch {
					return property.initializer.getText();
				}
			})()
		])
	);
};

const extractEvent = (node: ts.ClassElement): TransformerEvent | undefined => {
	if (!ts.isPropertyDeclaration(node)) return;

	const decorator = findDecorator(node, CONSTANTS.DECORATOR_EVENT);

	if (!decorator) return;

	const options = readOptions(decorator);

	return {
		get node() {
			return node;
		},
		get decorator() {
			return decorator;
		},
		get name() {
			return node.name?.getText() || '';
		},
		get description() {
			return getDescription(node);
		},
		get cancelable() {
			return options.cancelable ?? false;
		},
		get detail() {
			return node.type?.getText() || '';
		},
		get tags() {
			return getTags(node);
		}
	};
};

const extractMethod = (node: ts.ClassElement): TransformerMethod | undefined => {
	if (!ts.isMethodDeclaration(node)) return;

	const decorator = findDecorator(node, CONSTANTS.DECORATOR_METHOD);

	if (!decorator) return;

	// TODO
	const parameters = node.parameters.map((parameter) => {
		const name = parameter.name.getText();
		return {
			node: parameter,
			name,
			description: ts
				.getJSDocParameterTags(parameter)
				.find((tag) => tag.name.getText() === name)
				?.comment?.toString()
				.replace(/\s+/g, ' '),
			required: !parameter.questionToken,
			type: parameter.type?.getText()
		};
	});

	const returns = node.type?.getText() || 'void';

	return {
		get node() {
			return node;
		},
		get decorator() {
			return decorator;
		},
		get name() {
			return node.name?.getText() || '';
		},
		get description() {
			return getDescription(node);
		},
		get async() {
			const checker = getTypeChecker(node);
			const signature = checker.getSignatureFromDeclaration(node);
			return !!(
				signature &&
				checker.getReturnTypeOfSignature(signature).getSymbol()?.getName() === 'Promise'
			);
		},
		get parameters() {
			return parameters;
		},
		get returns() {
			return returns;
		},
		get signature() {
			const list = parameters
				.map((parameter) => `${parameter.name}${parameter.required ? '' : '?'}: ${parameter.type}`)
				.join(', ');
			return `${node.name?.getText()}(${list}) => ${returns}`;
		},
		get tags() {
			return getTags(node);
		}
	};
};

const extractProperty = (node: ts.ClassElement): TransformerProperty | undefined => {
	if (!ts.isPropertyDeclaration(node) && !ts.isGetAccessorDeclaration(node)) return;

	const decorator = findDecorator(node, CONSTANTS.DECORATOR_PROPERTY);

	if (!decorator) return;

	const options = readOptions(decorator);

	const initializer =
		ts.isPropertyDeclaration(node) && node.initializer ? node.initializer.getText() : undefined;

	return {
		get node() {
			return node;
		},
		get decorator() {
			return decorator;
		},
		get name() {
			return node.name?.getText();
		},
		get description() {
			return getDescription(node);
		},
		get attribute() {
			return options.attribute || kebabCase(node.name?.getText() ?? '');
		},
		get initializer() {
			return initializer;
		},
		get readonly() {
			return ts.isGetAccessorDeclaration(node);
		},
		get reflects() {
			return options.reflect ?? false;
		},
		get required() {
			return ts.isPropertyDeclaration(node) && !node.questionToken && initializer === undefined;
		},
		get type() {
			return node.type?.getText() || '';
		},
		get tags() {
			return getTags(node);
		}
	};
};

const collect = <T>(
	classes: ts.ClassDeclaration[],
	extractor: (node: ts.ClassElement) => T | undefined
): T[] => {
	const result: T[] = [];

	for (const classNode of classes) {
		for (const member of classNode.members) {
			const extracted = extractor(member);
			if (extracted === undefined) continue;
			result.push(extracted);
		}
	}

	return result;
};

export const extract = (context: TransformerContext): void => {
	const classes: ts.ClassDeclaration[] = [];

	const visit = (node: ts.Node) => {
		if (ts.isClassDeclaration(node)) {
			classes.push(node);
		}
		ts.forEachChild(node, visit);
	};

	visit(context.parsed);

	context.classes = classes.map((node) => ({ node }));

	context.elements = classes
		.filter((node) => hasDecorator(node, CONSTANTS.DECORATOR_ELEMENT))
		.map((node) => ({
			node,
			key: kebabCase(node.name?.text ?? ''),
			name: node.name?.text ?? '',
			events: collect([node], extractEvent),
			methods: collect([node], extractMethod),
			properties: collect([node], extractProperty)
		}));

	context.events = collect(classes, extractEvent);
	context.methods = collect(classes, extractMethod);
	context.properties = collect(classes, extractProperty);
};
