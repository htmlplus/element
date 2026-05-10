import { default as default_2 } from '@babel/types';

declare type Return<T> = void | T | Promise<void> | Promise<T>;

export declare const rollup: (...plugins: TransformerPlugin[]) => {
    name: string;
    buildStart(): Promise<void>;
    load(id: string): Promise<string | undefined>;
    buildEnd(error?: Error): Promise<void>;
};

declare interface TransformerPlugin {
    name: string;
    options?: unknown;
    start?: (global: TransformerPluginGlobal) => Return<TransformerPluginGlobal>;
    run?: (context: TransformerPluginContext, global: TransformerPluginGlobal) => Return<TransformerPluginContext>;
    finish?: (global: TransformerPluginGlobal) => Return<TransformerPluginGlobal>;
}

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

declare interface TransformerPluginGlobal {
    contexts: Array<TransformerPluginContext>;
    metadata?: {
        [key: string]: unknown;
    };
}

export declare const vite: (...plugins: TransformerPlugin[]) => {
    name: string;
    buildStart(): Promise<void>;
    load(id: string): Promise<string | undefined>;
    writeBundle(_options: any, bundles: any): Promise<void>;
};

export { }
