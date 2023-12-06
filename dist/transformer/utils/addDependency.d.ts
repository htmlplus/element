import t from '@babel/types';
interface AddDependencyReturns {
    local?: string;
    node: t.ImportDeclaration;
}
export declare function addDependency(path: t.File | any, source: string, local?: string, imported?: string, comment?: boolean): AddDependencyReturns;
export {};
