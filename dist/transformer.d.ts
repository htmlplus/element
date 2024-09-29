import { ClassDeclaration, ClassProperty, ClassBody, ClassMethod, File } from '@babel/types';
import { ParserOptions } from '@babel/parser';

type Return<T> = void | T | Promise<void | T>;
interface TransformerPluginContext {
    skipped?: boolean;
    script?: string;
    assetsDestination?: string;
    assetsSource?: string;
    class?: ClassDeclaration;
    classEvents?: Array<ClassProperty>;
    classMembers?: ClassBody['body'];
    classMethods?: Array<ClassMethod>;
    className?: string;
    classProperties?: Array<ClassProperty>;
    classStates?: Array<ClassProperty>;
    directoryName?: string;
    directoryPath?: string;
    elementKey?: string;
    elementInterfaceName?: string;
    elementTagName?: string;
    fileAST?: File;
    fileContent?: string;
    fileExtension?: string;
    fileName?: string;
    filePath?: string;
    metadata?: {
        [key: string]: any;
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
        [key: string]: any;
    };
}
interface TransformerPlugin {
    name: string;
    options?: any;
    start?: (global: TransformerPluginGlobal) => Return<TransformerPluginGlobal>;
    run?: (context: TransformerPluginContext, global: TransformerPluginGlobal) => Return<TransformerPluginContext>;
    finish?: (global: TransformerPluginGlobal) => Return<TransformerPluginGlobal>;
}

declare const transformer: (...plugins: TransformerPlugin[]) => {
    global: TransformerPluginGlobal;
    start: () => Promise<void>;
    run: (filePath: string) => Promise<TransformerPluginContext>;
    finish: () => Promise<void>;
};

declare const ASSETS_OPTIONS: Partial<AssetsOptions>;
interface AssetsOptions {
    destination?: (context: TransformerPluginContext) => string;
    source?: (context: TransformerPluginContext) => string;
}
declare const assets: (options?: AssetsOptions) => TransformerPlugin;

declare const COPY_OPTIONS: Partial<CopyOptions>;
interface CopyOptions {
    at?: 'start' | 'run' | 'finish';
    destination: string;
    source: string;
    transformer?: (content: string) => string;
}
declare const copy: (options: CopyOptions) => TransformerPlugin;

declare const CUSTOM_ELEMENT_OPTIONS: Partial<CustomElementOptions>;
interface CustomElementOptions {
    prefix?: string;
    typings?: boolean;
}
declare const customElement: (options?: CustomElementOptions) => TransformerPlugin;

declare const DOCUMENT_OPTIONS: Partial<DocumentOptions>;
interface DocumentOptions {
    destination: string;
    transformer?: (context: TransformerPluginContext, element: any) => any;
}
declare const document: (options?: DocumentOptions) => TransformerPlugin;

declare const extract: () => TransformerPlugin;

declare const PARSE_OPTIONS: Partial<ParseOptions>;
interface ParseOptions extends ParserOptions {
}
declare const parse: (options?: ParseOptions) => TransformerPlugin;

declare const READ_OPTIONS: Partial<ReadOptions>;
interface ReadOptions {
    encoding: 'utf8' | 'ascii' | 'utf-8' | 'utf16le' | 'utf-16le' | 'ucs2' | 'ucs-2' | 'base64' | 'base64url' | 'latin1' | 'binary' | 'hex';
    flag?: string | undefined;
}
declare const read: (options?: ReadOptions) => TransformerPlugin;

declare const README_OPTIONS: Partial<ReadmeOptions>;
interface ReadmeOptions {
    source?: (context: TransformerPluginContext) => string;
}
declare const readme: (options?: ReadmeOptions) => TransformerPlugin;

declare const STYLE_OPTIONS: Partial<StyleOptions>;
interface StyleOptions {
    source?: (context: TransformerPluginContext) => string | string[];
}
declare const style: (options?: StyleOptions) => TransformerPlugin;

declare const validate: () => TransformerPlugin;

declare const VISUAL_STUDIO_CODE_OPTIONS: Partial<VisualStudioCodeOptions>;
interface VisualStudioCodeOptions {
    destination?: string;
    reference?: (context: TransformerPluginContext) => string;
    transformer?: (context: TransformerPluginContext, element: any) => any;
}
declare const visualStudioCode: (options?: VisualStudioCodeOptions) => TransformerPlugin;

declare const WEB_TYPES_OPTIONS: Partial<WebTypesOptions>;
interface WebTypesOptions {
    destination?: string;
    packageName?: string;
    packageVersion?: string;
    reference?: (context: TransformerPluginContext) => string;
    transformer?: (context: TransformerPluginContext, element: any) => any;
}
declare const webTypes: (options?: WebTypesOptions) => TransformerPlugin;

export { ASSETS_OPTIONS, type AssetsOptions, COPY_OPTIONS, CUSTOM_ELEMENT_OPTIONS, type CopyOptions, type CustomElementOptions, DOCUMENT_OPTIONS, type DocumentOptions, PARSE_OPTIONS, type ParseOptions, README_OPTIONS, READ_OPTIONS, type ReadOptions, type ReadmeOptions, STYLE_OPTIONS, type StyleOptions, type TransformerPlugin, type TransformerPluginContext, type TransformerPluginGlobal, VISUAL_STUDIO_CODE_OPTIONS, type VisualStudioCodeOptions, WEB_TYPES_OPTIONS, type WebTypesOptions, assets, copy, customElement, document, extract, parse, read, readme, style, transformer, validate, visualStudioCode, webTypes };
