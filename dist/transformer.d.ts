import { default as default_2 } from '@babel/types';
import { ParserOptions } from '@babel/parser';

export declare const assets: TransformerPlugin<AssetsOptions | undefined>;

export declare const ASSETS_OPTIONS: {
    destination(context: TransformerPluginContext): string;
    source(context: TransformerPluginContext): string;
    json(context: TransformerPluginContext): string;
};

export declare interface AssetsOptions {
    destination?: (context: TransformerPluginContext) => string;
    source?: (context: TransformerPluginContext) => string;
    json?: (context: TransformerPluginContext) => string;
}

export declare const customElement: TransformerPlugin;

declare const document_2: TransformerPluginBatch<DocumentOptions | undefined>;
export { document_2 as document }

export declare const DOCUMENT_OPTIONS: {
    destination: string;
    transformer: (json: Json) => Json;
};

export declare interface DocumentOptions {
    destination?: string;
    transformer?: (json: Json) => Json;
}

export declare const extract: TransformerPlugin;

declare type Json = {
    elements: {
        title: string;
    }[];
};

declare type Json_2 = {
    $schema: string;
    version: number;
    tags: {
        name: string;
        attributes: {
            name: string;
            values: {
                name: string;
            }[];
            description?: string;
        }[];
        references: {
            name: string;
            url: string;
        }[];
        description?: string;
    }[];
};

declare type Json_3 = {
    $schema: string;
    name: string;
    version: string;
    'description-markup': string;
    'framework-config': {
        'enable-when': {
            'node-packages': string[];
        };
    };
    contributions: {
        html: {
            elements: {
                name: string;
                description?: string;
                'doc-url'?: string;
                attributes: {
                    name: string;
                    value: {
                        type: string;
                    };
                    default?: boolean | string | number;
                    description?: string;
                }[];
                js: {
                    events: {
                        name: string;
                        description?: string;
                    }[];
                    properties: {
                        name: string;
                        default?: boolean | string | number;
                        description?: string;
                    }[];
                };
                slots: {
                    name: string;
                    description?: string;
                }[];
            }[];
        };
    };
};

export declare const parse: TransformerPlugin<ParseOptions | undefined>;

export declare const PARSE_OPTIONS: ParseOptions;

export declare interface ParseOptions extends ParserOptions {
}

export declare const read: TransformerPlugin;

export declare const style: TransformerPlugin<StyleOptions | undefined>;

export declare const STYLE_OPTIONS: {
    source(context: TransformerPluginContext): string[];
};

export declare interface StyleOptions {
    source?: (context: TransformerPluginContext) => string | string[];
}

export declare const transformer: (options?: TransformerOptions) => {
    transform: (id: string) => TransformerPluginContext;
    finish: () => void;
};

export declare type TransformerOptions = {
    style?: StyleOptions;
    assets?: AssetsOptions;
    document?: DocumentOptions;
    visualStudioCode?: VisualStudioCodeOptions;
    webTypes?: WebTypesOptions;
};

export declare type TransformerPlugin<Options = undefined> = (context: TransformerPluginContext, options?: Options) => TransformerPluginContext | undefined;

export declare type TransformerPluginBatch<Options = undefined> = (contexts: TransformerPluginContext[], options?: Options) => void;

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
    styleContent?: string;
    styleContentTransformed?: string;
    styleExtension?: string;
    styleName?: string;
    stylePath?: string;
}

export declare const validate: TransformerPlugin;

export declare const VISUAL_STUDIO_CODE_OPTIONS: {
    destination: string;
    reference: () => string;
    transformer: (json: Json_2) => Json_2;
};

export declare const visualStudioCode: TransformerPluginBatch<VisualStudioCodeOptions | undefined>;

export declare interface VisualStudioCodeOptions {
    destination?: string;
    reference?: (context: TransformerPluginContext) => string;
    transformer?: (json: Json_2) => Json_2;
}

export declare const WEB_TYPES_OPTIONS: {
    destination: string;
    packageName: string;
    packageVersion: string;
    reference: () => string;
    transformer: (json: Json_3) => Json_3;
};

export declare const webTypes: TransformerPluginBatch<WebTypesOptions | undefined>;

export declare interface WebTypesOptions {
    destination?: string;
    packageName?: string;
    packageVersion?: string;
    reference?: (context: TransformerPluginContext) => string;
    transformer?: (json: Json_3) => Json_3;
}

export { }
