import type t from '@babel/types';

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

	// style
	styleContent?: string;
	styleContentTransformed?: string;
	styleExtension?: string;
	styleName?: string;
	stylePath?: string;
}

export type TransformerPlugin<Options = undefined> = (
	context: TransformerPluginContext,
	options?: Options
) => TransformerPluginContext | undefined;

export type TransformerPluginBatch<Options = undefined> = (
	contexts: TransformerPluginContext[],
	options?: Options
) => void;
