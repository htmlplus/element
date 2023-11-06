import t from '@babel/types';
export interface IToPropertySignatureOptions {
    optional?: boolean;
    keyTransformer?: (key: string) => string;
    typeAnnotationTransformer?: (typeAnnotation: t.Noop | t.TSTypeAnnotation | t.TypeAnnotation | null | undefined) => t.TSTypeAnnotation | null | undefined;
}
export declare const toPropertySignature: (property: t.ClassProperty, options?: IToPropertySignatureOptions) => t.TSPropertySignature;
