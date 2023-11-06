import t from '@babel/types';
export const toEventTypeAnnotation = (typeAnnotation) => {
    var _a;
    return t.tsTypeAnnotation(t.tsFunctionType(undefined, [
        Object.assign({}, t.identifier('event'), {
            typeAnnotation: t.tsTypeAnnotation(t.tsTypeReference(t.identifier('CustomEvent'), (_a = typeAnnotation === null || typeAnnotation === void 0 ? void 0 : typeAnnotation['typeAnnotation']) === null || _a === void 0 ? void 0 : _a.typeParameters))
        })
    ], t.tsTypeAnnotation(t.tsVoidKeyword())));
};
