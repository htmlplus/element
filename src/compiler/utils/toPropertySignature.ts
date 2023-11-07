import t from '@babel/types';

export interface IToPropertySignatureOptions {
  optional?: boolean;
  keyTransformer?: (key: string) => string;
  typeAnnotationTransformer?: (
    typeAnnotation: t.Noop | t.TSTypeAnnotation | t.TypeAnnotation | null | undefined
  ) => t.TSTypeAnnotation | null | undefined;
}

export const toPropertySignature = (
  property: t.ClassProperty,
  options?: IToPropertySignatureOptions
): t.TSPropertySignature => {
  const key = property.key as t.Identifier;

  const typeAnnotation = property.typeAnnotation as t.TSTypeAnnotation;

  return Object.assign(
    t.tSPropertySignature(
      t.stringLiteral(options?.keyTransformer?.(key.name) || key.name),
      options?.typeAnnotationTransformer?.(typeAnnotation) || typeAnnotation
    ),
    {
      optional: options?.optional ?? property.optional,
      leadingComments: t.cloneNode(property, true).leadingComments
    }
  );
};
