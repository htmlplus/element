import { ClassBody, ClassDeclaration, ClassMethod, ClassProperty, File } from '@babel/types';
type Return<T> = void | T | Promise<void | T>;
export interface TransformerPluginContext {
    customElementNames?: Array<string>;
    isInvalid?: boolean;
    script?: string;
    assets?: string;
    class?: ClassDeclaration;
    classEvents?: Array<ClassProperty>;
    classHasMount?: boolean;
    classHasUnmount?: boolean;
    classMembers?: ClassBody['body'];
    classMethods?: Array<ClassMethod>;
    className?: string;
    classProperties?: Array<ClassProperty>;
    classRender?: ClassMethod;
    classStates?: Array<ClassProperty>;
    componentKey?: string;
    directoryName?: string;
    directoryPath?: string;
    fileAST?: File;
    fileContent?: string;
    fileExtension?: string;
    fileName?: string;
    filePath?: string;
    readmeContent?: string;
    readmePath?: string;
    styleContent?: string;
    styleDependencies?: Array<string>;
    styleParsed?: string;
    stylePath?: string;
}
export interface TransformerPluginGlobal {
    contexts: Array<TransformerPluginContext>;
}
export interface TransformerPlugin {
    name: string;
    options?: any;
    start?: (global: TransformerPluginGlobal) => Return<TransformerPluginGlobal>;
    run?: (context: TransformerPluginContext, global: TransformerPluginGlobal) => Return<TransformerPluginContext>;
    finish?: (global: TransformerPluginGlobal) => Return<TransformerPluginGlobal>;
}
export {};
