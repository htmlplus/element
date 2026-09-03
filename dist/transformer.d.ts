import { default as default_2 } from 'typescript';
import { default as default_3 } from 'magic-string';

export declare const assets: (contexts: TransformerContext[], userOptions?: AssetsOptions) => void;

export declare const ASSETS_OPTIONS: {
    destination(context: TransformerContext): string;
    json(context: TransformerContext): string;
    source(context: TransformerContext): string;
};

export declare type AssetsOptions = {
    destination?: (context: TransformerContext, element: TransformerElement) => string;
    json?: (context: TransformerContext, element: TransformerElement) => string;
    source?: (context: TransformerContext, element: TransformerElement) => string;
};

export declare const createTransformer: (options?: TransformerOptions) => {
    finish: () => void;
    transform: (filePath: string) => string | undefined;
};

declare const document_2: (contexts: TransformerContext[], userOptions?: DocumentOptions) => void;
export { document_2 as document }

export declare const DOCUMENT_OPTIONS: {
    destination: string;
    transform: (json: DocumentJson) => DocumentJson;
};

export declare type DocumentJson = Record<string, unknown>;

export declare type DocumentOptions<T = DocumentJson> = {
    destination?: string;
    transform?: (json: DocumentJson) => T;
};

declare type PluginOptions<T> = T & {
    enable?: boolean;
};

export declare const property: (context: TransformerContext) => void;

export declare const readme: (_context: TransformerContext[], userOptions?: ReadmeOptions) => void;

export declare const README_OPTIONS: {};

export declare type ReadmeOptions = {
    unknown?: unknown;
};

export declare const style: (context: TransformerContext, userOptions?: StyleOptions) => void;

export declare const STYLE_OPTIONS: {
    resolver(_context: TransformerContext, element: TransformerElement): string;
    source(context: TransformerContext): string[];
};

export declare type StyleOptions = {
    resolver?: (context: TransformerContext, element: TransformerElement) => string;
    source?: (context: TransformerContext, element: TransformerElement) => string | string[];
};

export declare const tag: (context: TransformerContext) => void;

export declare type TransformerClass = {
    node: default_2.ClassDeclaration;
};

export declare type TransformerContext = {
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
    parsed: default_2.SourceFile;
    script: default_3;
};

export declare type TransformerElement = {
    key: string;
    name: string;
    node: default_2.ClassDeclaration;
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

export declare type TransformerEvent = {
    node: default_2.PropertyDeclaration;
    decorator: default_2.Decorator;
    name: string;
    description: string;
    cancelable: boolean;
    detail: string;
    tags: TransformerTag[];
};

export declare type TransformerMethod = {
    node: default_2.MethodDeclaration;
    decorator: default_2.Decorator;
    name: string;
    description: string;
    async: boolean;
    parameters: TransformerMethodParameter[];
    returns: string;
    signature: string;
    tags: TransformerTag[];
};

export declare type TransformerMethodParameter = {
    node: default_2.ParameterDeclaration;
    name: string;
    description?: string;
    required: boolean;
    type?: string;
};

export declare type TransformerOptions = {
    style?: PluginOptions<StyleOptions>;
    assets?: PluginOptions<AssetsOptions>;
    types?: PluginOptions<TypesOptions>;
    document?: PluginOptions<DocumentOptions>;
    visualStudioCode?: PluginOptions<VisualStudioCodeOptions>;
    webTypes?: PluginOptions<WebTypesOptions>;
};

export declare type TransformerProperty = {
    node: default_2.PropertyDeclaration | default_2.GetAccessorDeclaration;
    decorator: default_2.Decorator;
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

export declare type TransformerTag = {
    name: string;
    description: string;
};

export declare const types: (contexts: TransformerContext[], userOptions: TypesOptions) => void;

export declare const TYPES_OPTIONS: {
    mode: "new";
    destination(context: TransformerContext): string;
    transform(_context: TransformerContext, output: TypesTransformOutput): string;
};

export declare type TypesOptions = {
    mode?: 'append' | 'prepend' | 'new';
    destination?: (context: TransformerContext) => string;
    transform?: (context: TransformerContext, output: TypesTransformOutput) => string;
};

export declare type TypesTransformOutput = {
    content: string;
    current: string;
    final: string;
};

export declare const VISUAL_STUDIO_CODE_OPTIONS: {
    destination: string;
    reference: () => string;
    transform: (json: VisualStudioCodeJson) => VisualStudioCodeJson;
};

export declare const visualStudioCode: (contexts: TransformerContext[], userOptions?: VisualStudioCodeOptions) => void;

export declare type VisualStudioCodeJson = Record<string, unknown>;

export declare type VisualStudioCodeOptions<T = VisualStudioCodeJson> = {
    destination?: string;
    reference?: (context: TransformerContext, element: TransformerElement) => string;
    transform?: (json: VisualStudioCodeJson) => T;
};

export declare const WEB_TYPES_OPTIONS: {
    destination: string;
    packageName: string;
    packageVersion: string;
    reference: () => string;
    transform: (json: WebTypesJson) => WebTypesJson;
};

export declare const webTypes: (contexts: TransformerContext[], userOptions?: WebTypesOptions) => void;

export declare type WebTypesJson = Record<string, unknown>;

export declare type WebTypesOptions<T = WebTypesJson> = {
    destination?: string;
    packageName?: string;
    packageVersion?: string;
    reference?: (context: TransformerContext, element: TransformerElement) => string;
    transform?: (json: WebTypesJson) => T;
};

export { }
