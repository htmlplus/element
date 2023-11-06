import t from '@babel/types';

export const toEventTypeAnnotation = (
  typeAnnotation: t.Noop | t.TSTypeAnnotation | t.TypeAnnotation | null | undefined
) => {
  return t.tsTypeAnnotation(
    t.tsFunctionType(
      undefined,
      [
        Object.assign({}, t.identifier('event'), {
          typeAnnotation: t.tsTypeAnnotation(
            t.tsTypeReference(t.identifier('CustomEvent'), typeAnnotation?.['typeAnnotation']?.typeParameters)
          )
        })
      ],
      t.tsTypeAnnotation(t.tsVoidKeyword())
    )
  );
};
