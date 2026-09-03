import { default as default_2 } from 'typescript';
import { default as default_3 } from 'magic-string';
import { Plugin as Plugin_2 } from 'rollup';

declare type AssetsOptions = {
    destination?: (context: TransformerContext, element: TransformerElement) => string;
    json?: (context: TransformerContext, element: TransformerElement) => string;
    source?: (context: TransformerContext, element: TransformerElement) => string;
};

declare type DocumentJson = Record<string, unknown>;

declare type DocumentOptions<T = DocumentJson> = {
    destination?: string;
    transform?: (json: DocumentJson) => T;
};

declare type PluginOptions<T> = T & {
    enable?: boolean;
};

export declare const rollup: (options?: TransformerOptions | undefined) => Plugin_2<any> | Plugin_2<any>[];

declare type StyleOptions = {
    resolver?: (context: TransformerContext, element: TransformerElement) => string;
    source?: (context: TransformerContext, element: TransformerElement) => string | string[];
};

declare type TransformerClass = {
    node: default_2.ClassDeclaration;
};

declare type TransformerContext = {
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

declare type TransformerElement = {
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

declare type TransformerEvent = {
    node: default_2.PropertyDeclaration;
    decorator: default_2.Decorator;
    name: string;
    description: string;
    cancelable: boolean;
    detail: string;
    tags: TransformerTag[];
};

declare type TransformerMethod = {
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

declare type TransformerMethodParameter = {
    node: default_2.ParameterDeclaration;
    name: string;
    description?: string;
    required: boolean;
    type?: string;
};

declare type TransformerOptions = {
    style?: PluginOptions<StyleOptions>;
    assets?: PluginOptions<AssetsOptions>;
    types?: PluginOptions<TypesOptions>;
    document?: PluginOptions<DocumentOptions>;
    visualStudioCode?: PluginOptions<VisualStudioCodeOptions>;
    webTypes?: PluginOptions<WebTypesOptions>;
};

declare type TransformerProperty = {
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

declare type TransformerTag = {
    name: string;
    description: string;
};

declare type TypesOptions = {
    mode?: 'append' | 'prepend' | 'new';
    destination?: (context: TransformerContext) => string;
    transform?: (context: TransformerContext, output: TypesTransformOutput) => string;
};

declare type TypesTransformOutput = {
    content: string;
    current: string;
    final: string;
};

declare type VisualStudioCodeJson = Record<string, unknown>;

declare type VisualStudioCodeOptions<T = VisualStudioCodeJson> = {
    destination?: string;
    reference?: (context: TransformerContext, element: TransformerElement) => string;
    transform?: (json: VisualStudioCodeJson) => T;
};

export declare const vite: (options?: TransformerOptions | undefined) => Plugin_2<any> | Plugin_2<any>[];

declare type WebTypesJson = Record<string, unknown>;

declare type WebTypesOptions<T = WebTypesJson> = {
    destination?: string;
    packageName?: string;
    packageVersion?: string;
    reference?: (context: TransformerContext, element: TransformerElement) => string;
    transform?: (json: WebTypesJson) => T;
};

export { }
