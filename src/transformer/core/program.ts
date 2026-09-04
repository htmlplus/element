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

const sourceFiles = new Map<string, ts.SourceFile>();

const createHost = (options: ts.CompilerOptions): ts.CompilerHost => {
	const host = ts.createCompilerHost(options, true);
	const defaultGetSourceFile = host.getSourceFile.bind(host);

	host.getSourceFile = (fileName, languageVersionOrOptions, onError, shouldCreateNewSourceFile) => {
		const text = host.readFile(fileName);

		const cached = text !== undefined ? sourceFiles.get(fileName) : undefined;

		if (cached && cached.text === text) return cached;

		const sourceFile = defaultGetSourceFile(
			fileName,
			languageVersionOrOptions,
			onError,
			shouldCreateNewSourceFile
		);

		if (sourceFile) sourceFiles.set(fileName, sourceFile);

		return sourceFile;
	};

	return host;
};

const build = (fromPath: string, oldProgram?: ts.Program) => {
	const configPath = ts.findConfigFile(path.dirname(fromPath), ts.sys.fileExists, 'tsconfig.json');

	let rootNames: string[] = [];

	let options: ts.CompilerOptions = { ...FALLBACK_OPTIONS };

	if (configPath) {
		const { config } = ts.readConfigFile(configPath, ts.sys.readFile);

		const parsed = ts.parseJsonConfigFileContent(config ?? {}, ts.sys, path.dirname(configPath));

		rootNames = parsed.fileNames;

		options = { ...options, ...parsed.options, noEmit: true };
	}

	const program = ts.createProgram({ options, rootNames, oldProgram, host: createHost(options) });

	return { program, checker: program.getTypeChecker() };
};

/**
 * Returns the {@link ts.SourceFile} for `filePath` from a shared, lazily created
 * {@link ts.Program} (so the type checker can resolve imported/aliased types).
 * Falls back to a standalone parse when the file is not part of the program.
 */
export const getSourceFile = (filePath: string, content: string): ts.SourceFile => {
	if (!cache) cache = build(filePath);

	let fromProgram = cache.program.getSourceFile(filePath);

	if (fromProgram && fromProgram.text !== content) {
		cache = build(filePath, cache.program);
		fromProgram = cache.program.getSourceFile(filePath);
	}

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
