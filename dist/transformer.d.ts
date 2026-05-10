import { default as default_2 } from '@babel/types';
import { ParserOptions } from '@babel/parser';

export declare const assets: (userOptions?: AssetsOptions) => TransformerPlugin;

export declare const ASSETS_OPTIONS: InvertOptional<AssetsOptions>;

export declare interface AssetsOptions {
    destination?: (context: TransformerPluginContext) => string;
    source?: (context: TransformerPluginContext) => string;
    json?: (context: TransformerPluginContext) => string;
}

export declare const copy: (userOptions: CopyOptions) => TransformerPlugin;

export declare const COPY_OPTIONS: InvertOptional<CopyOptions>;

export declare interface CopyOptions {
    at?: 'start' | 'run' | 'finish';
    destination: string;
    source: string;
    transformer?: (content: string) => string;
}

export declare const CUSTOM_ELEMENT_OPTIONS: InvertOptional<CustomElementOptions>;

export declare const customElement: (userOptions?: CustomElementOptions) => TransformerPlugin;

export declare interface CustomElementOptions {
    prefix?: string;
    typings?: boolean;
}

declare const document_2: (userOptions?: DocumentOptions) => TransformerPlugin;
export { document_2 as document }

export declare const DOCUMENT_OPTIONS: InvertOptional<DocumentOptions>;

export declare interface DocumentOptions {
    destination?: string;
    transformer?: (context: TransformerPluginContext, element: unknown) => unknown;
}

export declare const extract: () => TransformerPlugin;

export declare type InvertOptional<T> = {
    [K in keyof T as undefined extends T[K] ? K : never]-?: T[K];
} & {
    [K in keyof T as undefined extends T[K] ? never : K]?: T[K];
};

export declare const parse: (userOptions?: ParseOptions) => TransformerPlugin;

export declare const PARSE_OPTIONS: ParseOptions;

export declare interface ParseOptions extends ParserOptions {
}

export declare const read: () => TransformerPlugin;

export declare const readme: (userOptions?: ReadmeOptions) => TransformerPlugin;

export declare const README_OPTIONS: InvertOptional<ReadmeOptions>;

export declare interface ReadmeOptions {
    source?: (context: TransformerPluginContext) => string;
}

declare type Return<T> = void | T | Promise<void> | Promise<T>;

export declare const style: (userOptions?: StyleOptions) => TransformerPlugin;

export declare const STYLE_OPTIONS: InvertOptional<StyleOptions>;

export declare interface StyleOptions {
    source?: (context: TransformerPluginContext) => string | string[];
}

export declare const transformer: (...plugins: TransformerPlugin[]) => {
    global: TransformerPluginGlobal;
    start: () => Promise<void>;
    run: (filePath: string) => Promise<TransformerPluginContext>;
    finish: () => Promise<void>;
};

export declare interface TransformerPlugin {
    name: string;
    options?: unknown;
    start?: (global: TransformerPluginGlobal) => Return<TransformerPluginGlobal>;
    run?: (context: TransformerPluginContext, global: TransformerPluginGlobal) => Return<TransformerPluginContext>;
    finish?: (global: TransformerPluginGlobal) => Return<TransformerPluginGlobal>;
}

export declare interface TransformerPluginContext {
    skipped?: boolean;
    script?: string;
    assetsDestination?: string;
    assetsSource?: string;
    class?: default_2.ClassDeclaration;
    classEvents?: default_2.ClassProperty[];
    classMembers?: default_2.ClassBody['body'];
    classMethods?: default_2.ClassMethod[];
    className?: string;
    classProperties?: default_2.ClassProperty[];
    classStates?: default_2.ClassProperty[];
    directoryName?: string;
    directoryPath?: string;
    elementKey?: string;
    elementInterfaceName?: string;
    elementTagName?: string;
    fileAST?: default_2.File;
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

export declare interface TransformerPluginGlobal {
    contexts: Array<TransformerPluginContext>;
    metadata?: {
        [key: string]: unknown;
    };
}

export declare const validate: () => TransformerPlugin;

export declare const VISUAL_STUDIO_CODE_OPTIONS: InvertOptional<VisualStudioCodeOptions>;

export declare const visualStudioCode: (userOptions?: VisualStudioCodeOptions) => TransformerPlugin;

export declare interface VisualStudioCodeOptions {
    destination?: string;
    reference?: (context: TransformerPluginContext) => string;
    transformer?: (context: TransformerPluginContext, element: any) => any;
}

export declare const WEB_TYPES_OPTIONS: InvertOptional<WebTypesOptions>;

export declare const webTypes: (userOptions?: WebTypesOptions) => TransformerPlugin;

export declare interface WebTypesOptions {
    destination?: string;
    packageName?: string;
    packageVersion?: string;
    reference?: (context: TransformerPluginContext) => string;
    transformer?: (context: TransformerPluginContext, element: unknown) => unknown;
}

export { }
