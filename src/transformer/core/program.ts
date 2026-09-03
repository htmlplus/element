import path from 'node:path';

import ts from 'typescript';

const FALLBACK_OPTIONS: ts.CompilerOptions = {
	allowJs: true,
	jsx: ts.JsxEmit.Preserve,
	module: ts.ModuleKind.ESNext,
	moduleResolution: ts.ModuleResolutionKind.Bundler,
	skipLibCheck: true,
	strict: false,
	target: ts.ScriptTarget.ESNext
};

let cache: { program: ts.Program; checker: ts.TypeChecker } | undefined;

const build = (fromPath: string) => {
	const configPath = ts.findConfigFile(path.dirname(fromPath), ts.sys.fileExists, 'tsconfig.json');

	let rootNames: string[] = [];

	let options: ts.CompilerOptions = { ...FALLBACK_OPTIONS };

	if (configPath) {
		const { config } = ts.readConfigFile(configPath, ts.sys.readFile);

		const parsed = ts.parseJsonConfigFileContent(config ?? {}, ts.sys, path.dirname(configPath));

		rootNames = parsed.fileNames;

		options = { ...options, ...parsed.options, noEmit: true };
	}

	const program = ts.createProgram({ options, rootNames });

	return { program, checker: program.getTypeChecker() };
};

/**
 * Returns the {@link ts.SourceFile} for `filePath` from a shared, lazily created
 * {@link ts.Program} (so the type checker can resolve imported/aliased types).
 * Falls back to a standalone parse when the file is not part of the program.
 */
export const getSourceFile = (filePath: string, content: string): ts.SourceFile => {
	if (!cache) cache = build(filePath);

	const fromProgram = cache.program.getSourceFile(filePath);

	if (fromProgram) return fromProgram;

	return ts.createSourceFile(
		filePath,
		content,
		ts.ScriptTarget.Latest,
		true,
		filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
	);
};

/**
 * The shared type checker, but only when `node` belongs to the shared program
 * (otherwise the checker cannot reason about it).
 */
export const getTypeChecker = (node: ts.Node): ts.TypeChecker => {
	const sourceFile = node.getSourceFile();

	if (!cache || cache.program.getSourceFile(sourceFile.fileName) !== sourceFile) {
		throw new Error('TODO');
	}

	return cache.checker;
};
