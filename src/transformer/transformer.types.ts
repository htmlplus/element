import type t from '@babel/types';

type Return<T> = void | T | Promise<void> | Promise<T>;

export interface TransformerPluginContext {
	// general
	skipped?: boolean;
	script?: string;

	// assets
	assetsDestination?: string;
	assetsSource?: string;

	// class
	class?: t.ClassDeclaration;
	classEvents?: t.ClassProperty[];
	classMembers?: t.ClassBody['body'];
	classMethods?: t.ClassMethod[];
	className?: string;
	classProperties?: t.ClassProperty[];
	classStates?: t.ClassProperty[];

	// directory
	directoryName?: string;
	directoryPath?: string;

	// element
	elementKey?: string;
	elementInterfaceName?: string;
	elementTagName?: string;

	// file
	fileAST?: t.File;
	fileContent?: string;
	fileExtension?: string;
	fileName?: string;
	filePath?: string;

	// metadata
	metadata?: {
		[key: string]: unknown;
	};

	// readme
	readmeContent?: string;
	readmeExtension?: string;
	readmeName?: string;
	readmePath?: string;

	// style
	styleContent?: string;
	styleContentTransformed?: string;
	styleExtension?: string;
	styleName?: string;
	stylePath?: string;
}

export interface TransformerPluginGlobal {
	contexts: Array<TransformerPluginContext>;
	metadata?: {
		[key: string]: unknown;
	};
}

export interface TransformerPlugin {
	name: string;
	options?: unknown;
	start?: (global: TransformerPluginGlobal) => Return<TransformerPluginGlobal>;
	run?: (
		context: TransformerPluginContext,
		global: TransformerPluginGlobal
	) => Return<TransformerPluginContext>;
	finish?: (global: TransformerPluginGlobal) => Return<TransformerPluginGlobal>;
}

export type InvertOptional<T> = {
	[K in keyof T as undefined extends T[K] ? K : never]-?: T[K];
} & {
	[K in keyof T as undefined extends T[K] ? never : K]?: T[K];
};
