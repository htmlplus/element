import { ClassBody, ClassDeclaration, ClassMethod, ClassProperty, File } from '@babel/types';
type Return<T> = void | T | Promise<void | T>;
export interface TransformerPluginContext {
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
    styleExtension?: string;
    styleName?: string;
    stylePath?: string;
}
export interface TransformerPluginGlobal {
    contexts: Array<TransformerPluginContext>;
    metadata?: {
        [key: string]: any;
    };
}
export interface TransformerPlugin {
    name: string;
    options?: any;
    start?: (global: TransformerPluginGlobal) => Return<TransformerPluginGlobal>;
    run?: (context: TransformerPluginContext, global: TransformerPluginGlobal) => Return<TransformerPluginContext>;
    finish?: (global: TransformerPluginGlobal) => Return<TransformerPluginGlobal>;
}
export {};
