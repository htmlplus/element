import t from '@babel/types';
import { ParserOptions } from '@babel/parser';

type Return<T> = void | T | Promise<void> | Promise<T>;
interface TransformerPluginContext {
    skipped?: boolean;
    script?: string;
    assetsDestination?: string;
    assetsSource?: string;
    class?: t.ClassDeclaration;
    classEvents?: t.ClassProperty[];
    classMembers?: t.ClassBody['body'];
    classMethods?: t.ClassMethod[];
    className?: string;
    classProperties?: t.ClassProperty[];
    classStates?: t.ClassProperty[];
    directoryName?: string;
    directoryPath?: string;
    elementKey?: string;
    elementInterfaceName?: string;
    elementTagName?: string;
    fileAST?: t.File;
    fileContent?: string;
    fileExtension?: string;
    fileName?: string;
    filePath?: string;
    metadata?: {
        [key: string]: unknown;
    };
    readmeContent?: string;
    readmeExtension?: string;
    readmeName?: string;
    readmePath?: string;
    styleContent?: string;
    styleContentTransformed?: string;
    styleExtension?: string;
    styleName?: string;
    stylePath?: string;
}
interface TransformerPluginGlobal {
    contexts: Array<TransformerPluginContext>;
    metadata?: {
        [key: string]: unknown;
    };
}
interface TransformerPlugin {
    name: string;
    options?: unknown;
    start?: (global: TransformerPluginGlobal) => Return<TransformerPluginGlobal>;
    run?: (context: TransformerPluginContext, global: TransformerPluginGlobal) => Return<TransformerPluginContext>;
    finish?: (global: TransformerPluginGlobal) => Return<TransformerPluginGlobal>;
}
type InvertOptional<T> = {
    [K in keyof T as undefined extends T[K] ? K : never]-?: T[K];
} & {
    [K in keyof T as undefined extends T[K] ? never : K]?: T[K];
};

declare const ASSETS_OPTIONS: InvertOptional<AssetsOptions>;
interface AssetsOptions {
    destination?: (context: TransformerPluginContext) => string;
    source?: (context: TransformerPluginContext) => string;
    json?: (context: TransformerPluginContext) => string;
}
declare const assets: (userOptions?: AssetsOptions) => TransformerPlugin;

declare const COPY_OPTIONS: InvertOptional<CopyOptions>;
interface CopyOptions {
    at?: 'start' | 'run' | 'finish';
    destination: string;
    source: string;
    transformer?: (content: string) => string;
}
declare const copy: (userOptions: CopyOptions) => TransformerPlugin;

declare const CUSTOM_ELEMENT_OPTIONS: InvertOptional<CustomElementOptions>;
interface CustomElementOptions {
    prefix?: string;
    typings?: boolean;
}
declare const customElement: (userOptions?: CustomElementOptions) => TransformerPlugin;

declare const DOCUMENT_OPTIONS: InvertOptional<DocumentOptions>;
interface DocumentOptions {
    destination?: string;
    transformer?: (context: TransformerPluginContext, element: unknown) => unknown;
}
declare const document: (userOptions?: DocumentOptions) => TransformerPlugin;

declare const extract: () => TransformerPlugin;

declare const PARSE_OPTIONS: ParseOptions;
interface ParseOptions extends ParserOptions {
}
declare const parse: (userOptions?: ParseOptions) => TransformerPlugin;

declare const read: () => TransformerPlugin;

declare const README_OPTIONS: InvertOptional<ReadmeOptions>;
interface ReadmeOptions {
    source?: (context: TransformerPluginContext) => string;
}
declare const readme: (userOptions?: ReadmeOptions) => TransformerPlugin;

declare const STYLE_OPTIONS: InvertOptional<StyleOptions>;
interface StyleOptions {
    source?: (context: TransformerPluginContext) => string | string[];
}
declare const style: (userOptions?: StyleOptions) => TransformerPlugin;

declare const validate: () => TransformerPlugin;

declare const VISUAL_STUDIO_CODE_OPTIONS: InvertOptional<VisualStudioCodeOptions>;
interface VisualStudioCodeOptions {
    destination?: string;
    reference?: (context: TransformerPluginContext) => string;
    transformer?: (context: TransformerPluginContext, element: any) => any;
}
declare const visualStudioCode: (userOptions?: VisualStudioCodeOptions) => TransformerPlugin;

declare const WEB_TYPES_OPTIONS: InvertOptional<WebTypesOptions>;
interface WebTypesOptions {
    destination?: string;
    packageName?: string;
    packageVersion?: string;
    reference?: (context: TransformerPluginContext) => string;
    transformer?: (context: TransformerPluginContext, element: unknown) => unknown;
}
declare const webTypes: (userOptions?: WebTypesOptions) => TransformerPlugin;

declare const transformer: (...plugins: TransformerPlugin[]) => {
    global: TransformerPluginGlobal;
    start: () => Promise<void>;
    run: (filePath: string) => Promise<TransformerPluginContext>;
    finish: () => Promise<void>;
};

export { ASSETS_OPTIONS, COPY_OPTIONS, CUSTOM_ELEMENT_OPTIONS, DOCUMENT_OPTIONS, PARSE_OPTIONS, README_OPTIONS, STYLE_OPTIONS, VISUAL_STUDIO_CODE_OPTIONS, WEB_TYPES_OPTIONS, assets, copy, customElement, document, extract, parse, read, readme, style, transformer, validate, visualStudioCode, webTypes };
export type { AssetsOptions, CopyOptions, CustomElementOptions, DocumentOptions, InvertOptional, ParseOptions, ReadmeOptions, StyleOptions, TransformerPlugin, TransformerPluginContext, TransformerPluginGlobal, VisualStudioCodeOptions, WebTypesOptions };
