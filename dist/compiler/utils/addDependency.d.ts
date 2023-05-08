import { File, ImportDeclaration } from '@babel/types';
interface AddDependencyReturns {
    local?: string;
    node: ImportDeclaration;
}
export declare function addDependency(path: File | any, source: string): AddDependencyReturns;
export declare function addDependency(path: File | any, source: string, local: string): AddDependencyReturns;
export declare function addDependency(path: File | any, source: string, local: string, imported: string): AddDependencyReturns;
export {};
