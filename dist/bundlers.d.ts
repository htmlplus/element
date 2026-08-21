import { default as default_2 } from '@babel/types';
import { Plugin as Plugin_2 } from 'rollup';

declare interface AssetsOptions {
    destination?: (context: TransformerPluginContext) => string;
    source?: (context: TransformerPluginContext) => string;
    json?: (context: TransformerPluginContext) => string;
}

declare interface DocumentOptions {
    destination?: string;
    transformer?: (json: Json) => Json;
}

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

export declare const rollup: (options?: TransformerOptions | undefined) => Plugin_2<any> | Plugin_2<any>[];

declare interface StyleOptions {
    source?: (context: TransformerPluginContext) => string | string[];
}

declare type TransformerOptions = {
    style?: StyleOptions;
    assets?: AssetsOptions;
    document?: DocumentOptions;
    visualStudioCode?: VisualStudioCodeOptions;
    webTypes?: WebTypesOptions;
};

declare interface TransformerPluginContext {
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

declare interface VisualStudioCodeOptions {
    destination?: string;
    reference?: (context: TransformerPluginContext) => string;
    transformer?: (json: Json_2) => Json_2;
}

export declare const vite: (options?: TransformerOptions | undefined) => Plugin_2<any> | Plugin_2<any>[];

declare interface WebTypesOptions {
    destination?: string;
    packageName?: string;
    packageVersion?: string;
    reference?: (context: TransformerPluginContext) => string;
    transformer?: (json: Json_3) => Json_3;
}

export { }
