import { File, ImportDeclaration } from '@babel/types';
interface AddDependencyReturns {
    local?: string;
    node: ImportDeclaration;
}
export declare function addDependency(path: File | any, source: string, local?: string, imported?: string, comment?: boolean): AddDependencyReturns;
export {};
