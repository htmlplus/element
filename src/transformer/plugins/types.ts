import path from 'node:path';

import { kebabCase, pascalCase } from 'change-case';
import fs from 'fs-extra';
import ts from 'typescript';

import * as CONSTANTS from '@/constants';

import type {
	TransformerContext,
	TransformerEvent,
	TransformerMethod,
	TransformerProperty
} from '../transformer.types';

export const TYPES_OPTIONS = {
	mode: 'new',
	destination(context) {
		return path.join(context.directoryPath, `${context.fileName}.d.ts`);
	},
	transform(_context, output) {
		return output.final;
	}
} satisfies TypesOptions;

export type TypesOptions = {
	mode?: 'append' | 'prepend' | 'new';
	destination?: (context: TransformerContext) => string;
	transform?: (context: TransformerContext, output: TypesTransformOutput) => string;
};

export type TypesTransformOutput = {
	content: string;
	current: string;
	final: string;
};

const extractKeys = (
	members?: ts.MethodDeclaration[] | (ts.PropertyDeclaration | ts.GetAccessorDeclaration)[],
	filter?: (
		member: ts.MethodDeclaration | ts.PropertyDeclaration | ts.GetAccessorDeclaration
	) => boolean
) => {
	return (
		members
			?.filter((member) => member && (filter ? filter?.(member) : true))
			?.map((member) => (member.name && ts.isIdentifier(member.name) ? member.name.text : ''))
			?.map((key) => `'${key}'`)
			?.join(' | ') || 'never'
	);
};

export const types = (contexts: TransformerContext[], userOptions: TypesOptions): void => {
	const options = { ...TYPES_OPTIONS, ...userOptions };

	for (const context of contexts) {
		if (!context.elements.length) continue;

		let content = '';
		let current = '';

		for (const element of context.elements) {
			content += template({
				events: element.events,
				interface: `HTML${pascalCase(element.key)}Element`,
				methods: element.methods,
				name: element.name,
				properties: element.properties,
				tag: element.key
			});
		}

		const destination = options.destination(context);

		if (options.mode !== 'new' && fs.existsSync(destination)) {
			current = fs.readFileSync(destination, 'utf8');
		}

		const final = options.mode === 'prepend' ? `${content}${current}` : `${current}${content}`;

		const transformed = options.transform(context, { content, current, final });

		fs.outputFileSync(destination, transformed);
	}
};

type Model = {
	events: TransformerEvent[];
	interface: string;
	name: string;
	tag: string;
	properties: TransformerProperty[];
	methods: TransformerMethod[];
};

const template = (model: Model) => `
// THE FOLLOWING TYPES HAVE BEEN ADDED AUTOMATICALLY

type Filter<Base, Disables> = { [K in keyof Base as K extends keyof Disables ? [Disables[K]] extends [false] ? never : K : '*' extends keyof Disables ? [Disables['*']] extends [false] ? never : K : K]: Base[K] };
type Override<Base, Overrides, AllowedKeys> = { [K in keyof Base]: K extends AllowedKeys ? K extends keyof Overrides ? Overrides[K] : Base[K] : Base[K] };
type ToEventHandlers<T> = { [K in keyof T]?: T[K] extends EventEmitter<infer U> ? (event: CustomEvent<U>) => void : T[K] };
type ToJSXEvent<T> = { [K in keyof T as \`on\${Capitalize<string & K>}\`]: T[K] };
type Rename<T, M extends Partial<Record<keyof T, PropertyKey>>> = Partial<Pick<T, Exclude<keyof T, keyof M>>> & { [K in keyof M as M[K] extends PropertyKey ? M[K] : K]?: K extends keyof T ? T[K] : never };
export type ${model.name}AttributesMapper = {
  ${model.properties
		.map((property) => {
			if (!property.node.name || !ts.isIdentifier(property.node.name)) return '';

			const name = property.node.name.text;

			// @ts-expect-error
			const override = property.decorator.expression.arguments
				?.at(0)
				?.properties.find((property) => property.name.text === 'attribute')?.found
				?.initializer.text;

			const attribute = override || kebabCase(name);

			if (name === attribute) return '';

			return `'${name}': '${attribute}'`;
		})
		.filter(Boolean)
		.join(';\n  ')}
};
export type ${model.name}OverridableKeys = ${extractKeys(
	model.properties.map((item) => item.node),
	(property) =>
		!!property.type &&
		ts.isTypeReferenceNode(property.type) &&
		ts.isIdentifier(property.type.typeName) &&
		property.type.typeName.text === 'OverridableValue'
)};
export interface ${model.name}Disables {}
export interface ${model.name}Overrides {}
export type ${model.name}Attributes = Rename<${model.name}Properties, ${model.name}AttributesMapper>;
export type ${model.name}AttributesOverridden = Rename<${model.name}PropertiesOverridden, ${model.name}AttributesMapper>;
export type ${model.name}AttributesBase = Rename<${model.name}PropertiesBase, ${model.name}AttributesMapper>;
export type ${model.name}Events = Filter<${model.name}EventsBase, ${model.name}Disables>;
export type ${model.name}EventsBase = ToEventHandlers<Pick<${model.name}, ${model.name}EventsKeys>>;
export type ${model.name}EventsKeys = ${extractKeys(model.events.map((item) => item.node))};
export type ${model.name}EventsJSX = ToJSXEvent<${model.name}Events>;
export type ${model.name}EventsBaseJSX = ToJSXEvent<${model.name}EventsBase>;
export type ${model.name}Methods = Filter<${model.name}MethodsBase, ${model.name}Disables>;
export type ${model.name}MethodsBase = Pick<${model.name}, ${model.name}MethodsKeys>;
export type ${model.name}MethodsKeys = ${extractKeys(model.methods.map((item) => item.node))};
export type ${model.name}Properties = Filter<${model.name}PropertiesOverridden, ${model.name}Disables>;
export type ${model.name}PropertiesOverridden = Override<${model.name}PropertiesBase, ${model.name}Overrides, ${model.name}OverridableKeys>;
export type ${model.name}PropertiesBase = Pick<${model.name}, ${model.name}PropertiesKeys>;
export type ${model.name}PropertiesKeys = ${extractKeys(model.properties.map((item) => item.node))};
export type ${model.name}Element = globalThis.${model.interface};
export type ${model.name}JSX = ${model.name}Attributes & ${model.name}EventsJSX;
export namespace JSX {
  interface IntrinsicElements {
    "${model.tag}": ${model.name}JSX;
  }
}
declare global {
  interface ${model.interface} extends HTMLElement, ${model.name}Methods, ${model.name}Properties {}
  var ${model.interface}: {
    prototype: ${model.interface};
    new (): ${model.interface};
  };
  interface HTMLElementTagNameMap {
    "${model.tag}": ${model.interface};
  }
}
declare module '${CONSTANTS.PACKAGE_NAME}' {
  interface HTMLPlusElements {
    '${model.tag}': {
      properties: ${model.name}PropertiesOverridden;
    };
  }
}
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "${model.tag}": ${model.name}JSX & Omit<DetailedHTMLProps<HTMLAttributes<${model.interface}>, ${model.interface}>, keyof ${model.name}JSX>;
    }
  }
}
`;
