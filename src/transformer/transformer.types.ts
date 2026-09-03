import type MagicString from 'magic-string';
import type ts from 'typescript';

export type TransformerContext = {
	directoryName: string;
	directoryPath: string;

	fileContent: string;
	fileExtension: string;
	fileName: string;
	filePath: string;

	classes: TransformerClass[];
	elements: TransformerElement[];
	events: TransformerEvent[];
	methods: TransformerMethod[];
	properties: TransformerProperty[];

	parsed: ts.SourceFile;

	script: MagicString;
};

export type TransformerClass = {
	node: ts.ClassDeclaration;
};

export type TransformerElement = {
	key: string;
	name: string;

	node: ts.ClassDeclaration;

	assetsDestination?: string;
	assetsSource?: string;

	events: TransformerEvent[];
	methods: TransformerMethod[];
	properties: TransformerProperty[];

	styleContent?: string;
	styleExtension?: string;
	styleName?: string;
	stylePath?: string;
};

export type TransformerTag = {
	name: string;
	description: string;
};

export type TransformerMethodParameter = {
	node: ts.ParameterDeclaration;
	name: string;
	description?: string;
	required: boolean;
	type?: string;
};

export type TransformerEvent = {
	node: ts.PropertyDeclaration;
	decorator: ts.Decorator;
	name: string;
	description: string;
	cancelable: boolean;
	detail: string;
	tags: TransformerTag[];
};

export type TransformerMethod = {
	node: ts.MethodDeclaration;
	decorator: ts.Decorator;
	name: string;
	description: string;
	async: boolean;
	parameters: TransformerMethodParameter[];
	returns: string;
	signature: string;
	tags: TransformerTag[];
};

export type TransformerProperty = {
	node: ts.PropertyDeclaration | ts.GetAccessorDeclaration;
	decorator: ts.Decorator;
	name: string;
	description: string;
	attribute: string;
	initializer?: string;
	readonly: boolean;
	reflects: boolean;
	required: boolean;
	type: string;
	tags: TransformerTag[];
};
